"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  isLocalSponsorId,
  readLocalSponsors,
  removeLocalSponsor,
  upsertLocalSponsor,
} from "../_utils/local-sponsor-storage";
import {
  mapAccountSponsorToWorkspaceSponsor,
  refreshWorkspaceSponsorDerivedFields,
} from "../_utils/sponsor-display";
import {
  sponsorHasPoolPlacement,
  sponsorHasPrimaryPositionSlot,
} from "../_utils/sponsorship-allocation-general";

import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../_types/manage-sponsors";
import type { PatchAccountSponsorBody } from "@/types/api/account";

function isNumericServerSponsorId(id: number | string): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

async function invalidateSponsors(
  accountId: string,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
}

export function useManageSponsorsWorkspace(accountId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const [workspaceSponsors, setWorkspaceSponsors] = useState<ManageSponsorsWorkspaceSponsor[]>([]);
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
      const localSponsors = current.filter((sponsor) => isLocalSponsorId(sponsor.id));
      return [...localSponsors, ...serverSponsors];
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
      if (!sponsor.isActive) return false;

      const matchesSearch =
        search.length === 0 ||
        sponsor.name.toLowerCase().includes(search) ||
        sponsor.tagline?.toLowerCase().includes(search) === true;

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "placed":
          return sponsorHasPoolPlacement(sponsor);
        case "unassigned":
          return !sponsorHasPoolPlacement(sponsor);
        case "primary":
          return sponsor.isPrimary || sponsorHasPrimaryPositionSlot(sponsor);
        default:
          return true;
      }
    });
  }, [activeFilter, searchValue, workspaceSponsors]);

  const stats = useMemo(() => {
    const total = workspaceSponsors.length;
    const placed = workspaceSponsors.filter((sponsor) => sponsorHasPoolPlacement(sponsor)).length;
    const unassigned = workspaceSponsors.filter(
      (sponsor) => !sponsorHasPoolPlacement(sponsor),
    ).length;
    const archived = workspaceSponsors.filter((sponsor) => !sponsor.isActive).length;

    return {
      total,
      placed,
      unassigned,
      archived,
    };
  }, [workspaceSponsors]);

  async function saveSponsorEdits(params: {
    sponsorId: number | string;
    name: string;
    tagline: string | null;
    description: string | null;
    url: string | null;
    isActive: boolean;
    logoFile: File | null;
    clearLogo: boolean;
  }) {
    if (isNumericServerSponsorId(params.sponsorId)) {
      const sponsorId = params.sponsorId;
      const body: PatchAccountSponsorBody = {
        name: params.name.trim(),
        tagline: params.tagline,
        description: params.description,
        url: params.url,
        isActive: params.isActive,
        ...(params.isActive ? {} : { isPrimary: false, order: null }),
        ...(params.clearLogo ? { logoMediaId: null as number | null } : {}),
      };
      await accountApi.patchAccountSponsor(accountId, sponsorId, body);

      if (params.logoFile) {
        const formData = new FormData();
        formData.append("file", params.logoFile);
        await accountApi.postAccountSponsorLogoUpload(accountId, sponsorId, formData);
      }

      await invalidateSponsors(accountId, queryClient);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(params.sponsorId)) {
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
              sponsorshipAllocations: sponsor.sponsorshipAllocations,
            });
          })
          .map(refreshWorkspaceSponsorDerivedFields),
      );

      const existing = workspaceSponsors.find((sponsor) => sponsor.id === params.sponsorId);
      if (!existing || !isLocalSponsorId(existing.id)) return;

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
          sponsorshipAllocations: existing.sponsorshipAllocations,
        }),
      );
    }
  }

  async function restoreArchivedSponsor(sponsorId: number | string) {
    if (isNumericServerSponsorId(sponsorId)) {
      await accountApi.patchAccountSponsor(accountId, sponsorId, { isActive: true });
      await invalidateSponsors(accountId, queryClient);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(sponsorId)) {
      const existing = workspaceSponsors.find((sponsor) => sponsor.id === sponsorId);
      if (!existing) return;
      const restored = refreshWorkspaceSponsorDerivedFields({
        ...existing,
        isActive: true,
        isPrimary: false,
        rank: null,
      });
      setWorkspaceSponsors((current) =>
        current.map((sponsor) => (sponsor.id === sponsorId ? restored : sponsor)),
      );
      upsertLocalSponsor(accountId, restored);
    }
  }

  async function deleteSponsor(sponsorId: number | string) {
    if (isNumericServerSponsorId(sponsorId)) {
      await accountApi.deleteAccountSponsor(accountId, sponsorId);
      await invalidateSponsors(accountId, queryClient);
      await queryClient.removeQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
      return;
    }

    if (isLocalSponsorId(sponsorId)) {
      removeLocalSponsor(accountId, sponsorId);
      setWorkspaceSponsors((current) => current.filter((sponsor) => sponsor.id !== sponsorId));
    }
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
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    saveSponsorEdits,
    restoreArchivedSponsor,
    deleteSponsor,
    refetch: q.refetch,
  };
}
