"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  isLocalSponsorId,
  readLocalSponsors,
  upsertLocalSponsor,
} from "../_utils/local-sponsor-storage";
import {
  mapAccountSponsorToWorkspaceSponsor,
  refreshWorkspaceSponsorDerivedFields,
} from "../_utils/sponsor-display";

import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../_types/manage-sponsors";

export function useManageSponsorsWorkspace(accountId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const [workspaceSponsors, setWorkspaceSponsors] = useState<ManageSponsorsWorkspaceSponsor[]>([]);
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<ManageSponsorsLibraryFilter>("all");

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountSponsorsGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.sponsors(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  const serverSponsors = useMemo(() => {
    if (!q.isSuccess || !q.data || isAccountSponsorsGatewayRedirect(q.data)) return [];
    return q.data.data.items.map(mapAccountSponsorToWorkspaceSponsor);
  }, [q.data, q.isSuccess]);

  useEffect(() => {
    setWorkspaceSponsors(readLocalSponsors(accountId));
  }, [accountId]);

  useEffect(() => {
    if (serverSponsors.length === 0) return;

    setWorkspaceSponsors((current) => {
      const currentById = new Map(current.map((sponsor) => [String(sponsor.id), sponsor]));
      const localSponsors = current.filter((sponsor) => isLocalSponsorId(sponsor.id));
      const mergedServerSponsors = serverSponsors.map(
        (sponsor) => currentById.get(String(sponsor.id)) ?? sponsor,
      );
      return [...localSponsors, ...mergedServerSponsors];
    });
  }, [accountId, serverSponsors]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
      objectUrls.clear();
    };
  }, []);

  const filteredSponsors = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return workspaceSponsors.filter((sponsor) => {
      const matchesSearch =
        search.length === 0 ||
        sponsor.name.toLowerCase().includes(search) ||
        sponsor.tagline?.toLowerCase().includes(search) === true;

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "placed":
          return sponsor.isPrimary || sponsor.rank != null;
        case "unassigned":
          return !sponsor.isPrimary && sponsor.rank == null;
        case "primary":
          return sponsor.isPrimary;
        case "inactive":
          return !sponsor.isActive;
        default:
          return true;
      }
    });
  }, [activeFilter, searchValue, workspaceSponsors]);

  useEffect(() => {
    if (workspaceSponsors.length === 0) {
      setSelectedSponsorId(null);
      return;
    }

    setSelectedSponsorId((current) => {
      if (current != null && filteredSponsors.some((sponsor) => sponsor.id === current)) {
        return current;
      }
      if (current != null && workspaceSponsors.some((sponsor) => sponsor.id === current)) {
        return current;
      }
      return filteredSponsors[0]?.id ?? workspaceSponsors[0]?.id ?? null;
    });
  }, [filteredSponsors, workspaceSponsors]);

  const selectedSponsor = useMemo(
    () => workspaceSponsors.find((sponsor) => sponsor.id === selectedSponsorId) ?? null,
    [selectedSponsorId, workspaceSponsors],
  );

  const stats = useMemo(() => {
    const total = workspaceSponsors.length;
    const placed = workspaceSponsors.filter(
      (sponsor) => sponsor.isPrimary || sponsor.rank != null,
    ).length;
    const unassigned = workspaceSponsors.filter(
      (sponsor) => !sponsor.isPrimary && sponsor.rank == null,
    ).length;
    const inactive = workspaceSponsors.filter((sponsor) => !sponsor.isActive).length;
    const drafts = workspaceSponsors.filter((sponsor) => sponsor.isDraft).length;

    return {
      total,
      placed,
      unassigned,
      inactive,
      archived: 0,
      drafts,
    };
  }, [workspaceSponsors]);

  function saveSponsorEdits(params: {
    sponsorId: number | string;
    name: string;
    tagline: string | null;
    description: string | null;
    url: string | null;
    isActive: boolean;
    logoFile: File | null;
    clearLogo: boolean;
  }) {
    setWorkspaceSponsors((current) =>
      current
        .map((sponsor) => {
          if (sponsor.id !== params.sponsorId) return sponsor;

          let nextLogoUrl = sponsor.logoUrl;
          let nextHasLogo = sponsor.hasLogo;

          if (params.clearLogo) {
            if (nextLogoUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(nextLogoUrl);
              objectUrlsRef.current.delete(nextLogoUrl);
            }
            nextLogoUrl = null;
            nextHasLogo = false;
          } else if (params.logoFile) {
            if (nextLogoUrl?.startsWith("blob:")) {
              URL.revokeObjectURL(nextLogoUrl);
              objectUrlsRef.current.delete(nextLogoUrl);
            }
            nextLogoUrl = URL.createObjectURL(params.logoFile);
            objectUrlsRef.current.add(nextLogoUrl);
            nextHasLogo = true;
          }

          return refreshWorkspaceSponsorDerivedFields({
            ...sponsor,
            name: params.name.trim(),
            tagline: params.tagline,
            description: params.description,
            url: params.url,
            isActive: params.isActive,
            isPrimary: params.isActive ? sponsor.isPrimary : false,
            rank: params.isActive ? sponsor.rank : null,
            hasLogo: nextHasLogo,
            logoUrl: nextLogoUrl,
            logoAlt: params.name.trim() || sponsor.logoAlt,
            isDraft: false,
          });
        })
        .map(refreshWorkspaceSponsorDerivedFields),
    );

    const existing = workspaceSponsors.find((sponsor) => sponsor.id === params.sponsorId);
    if (existing && isLocalSponsorId(existing.id)) {
      let nextLogoUrl = existing.logoUrl;
      let nextHasLogo = existing.hasLogo;

      if (params.clearLogo) {
        nextLogoUrl = null;
        nextHasLogo = false;
      } else if (params.logoFile) {
        nextLogoUrl = URL.createObjectURL(params.logoFile);
        objectUrlsRef.current.add(nextLogoUrl);
        nextHasLogo = true;
      }

      upsertLocalSponsor(
        accountId,
        refreshWorkspaceSponsorDerivedFields({
          ...existing,
          name: params.name.trim(),
          tagline: params.tagline,
          description: params.description,
          url: params.url,
          isActive: params.isActive,
          isPrimary: params.isActive ? existing.isPrimary : false,
          rank: params.isActive ? existing.rank : null,
          hasLogo: nextHasLogo,
          logoUrl: nextLogoUrl,
          logoAlt: params.name.trim() || existing.logoAlt,
          isDraft: false,
        }),
      );
    }
  }

  function setPrimarySponsor(sponsorId: number | string) {
    setWorkspaceSponsors((current) =>
      current.map((sponsor) => {
        if (sponsor.id === sponsorId) {
          if (!sponsor.isActive || !sponsor.hasLogo) return sponsor;
          return refreshWorkspaceSponsorDerivedFields({ ...sponsor, isPrimary: true });
        }
        if (!sponsor.isPrimary) return sponsor;
        return refreshWorkspaceSponsorDerivedFields({ ...sponsor, isPrimary: false });
      }),
    );
  }

  function clearPrimarySponsor() {
    setWorkspaceSponsors((current) =>
      current.map((sponsor) =>
        sponsor.isPrimary
          ? refreshWorkspaceSponsorDerivedFields({ ...sponsor, isPrimary: false })
          : sponsor,
      ),
    );
  }

  function assignSponsorRank(sponsorId: number | string, rank: number) {
    if (!Number.isInteger(rank) || rank < 1 || rank > 30) return false;

    let didAssign = false;
    setWorkspaceSponsors((current) =>
      current.map((sponsor) => {
        if (sponsor.id === sponsorId) {
          if (!sponsor.isActive) return sponsor;
          didAssign = true;
          return refreshWorkspaceSponsorDerivedFields({ ...sponsor, rank });
        }
        if (sponsor.rank === rank) {
          return refreshWorkspaceSponsorDerivedFields({ ...sponsor, rank: null });
        }
        return sponsor;
      }),
    );
    return didAssign;
  }

  function removeSponsorRank(sponsorId: number | string) {
    setWorkspaceSponsors((current) =>
      current.map((sponsor) =>
        sponsor.id === sponsorId
          ? refreshWorkspaceSponsorDerivedFields({ ...sponsor, rank: null })
          : sponsor,
      ),
    );
  }

  function moveSponsorRank(sponsorId: number | string, direction: "up" | "down") {
    const sponsor = workspaceSponsors.find((item) => item.id === sponsorId);
    if (!sponsor?.rank) return false;

    const nextRank = direction === "up" ? sponsor.rank - 1 : sponsor.rank + 1;
    if (nextRank < 1 || nextRank > 30) return false;
    return assignSponsorRank(sponsorId, nextRank);
  }

  return {
    isRedirecting:
      !segmentOk || (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)),
    isLoading: q.isPending,
    isError: q.isError,
    errorMessage:
      q.isError && q.error instanceof Error ? q.error.message : AUTH_ERROR_MESSAGES.network,
    sponsors: filteredSponsors,
    workspaceSponsors,
    stats,
    selectedSponsor,
    selectedSponsorId,
    setSelectedSponsorId,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    saveSponsorEdits,
    setPrimarySponsor,
    clearPrimarySponsor,
    assignSponsorRank,
    removeSponsorRank,
    moveSponsorRank,
    refetch: q.refetch,
  };
}
