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

import { mapAccountSponsorToWorkspaceSponsor } from "../_utils/sponsor-display";

import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../_types/manage-sponsors";

function createDraftSponsor(nextDraftNumber: number): ManageSponsorsWorkspaceSponsor {
  return {
    id: `draft-${nextDraftNumber}`,
    name: `New sponsor ${nextDraftNumber}`,
    tagline: null,
    description: null,
    url: null,
    startDate: null,
    endDate: null,
    isActive: false,
    isPrimary: false,
    rank: null,
    hasLogo: false,
    logoUrl: null,
    logoAlt: null,
    allocationCount: 0,
    placementLabel: "Unassigned",
    usageLabel: "Draft sponsor",
    isDraft: true,
  };
}

export function useManageSponsorsWorkspace(accountId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });
  const [draftSponsors, setDraftSponsors] = useState<ManageSponsorsWorkspaceSponsor[]>([]);
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

  const sponsors = useMemo(() => {
    if (!q.isSuccess || !q.data || isAccountSponsorsGatewayRedirect(q.data)) return [];
    return q.data.data.items.map(mapAccountSponsorToWorkspaceSponsor);
  }, [q.data, q.isSuccess]);

  const allSponsors = useMemo(() => [...draftSponsors, ...sponsors], [draftSponsors, sponsors]);

  const filteredSponsors = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return allSponsors.filter((sponsor) => {
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
  }, [activeFilter, allSponsors, searchValue]);

  useEffect(() => {
    if (allSponsors.length === 0) {
      setSelectedSponsorId(null);
      return;
    }

    setSelectedSponsorId((current) => {
      if (current != null && filteredSponsors.some((sponsor) => sponsor.id === current)) {
        return current;
      }
      if (current != null && allSponsors.some((sponsor) => sponsor.id === current)) {
        return current;
      }
      return filteredSponsors[0]?.id ?? allSponsors[0]?.id ?? null;
    });
  }, [allSponsors, filteredSponsors]);

  const selectedSponsor = useMemo(
    () => allSponsors.find((sponsor) => sponsor.id === selectedSponsorId) ?? null,
    [allSponsors, selectedSponsorId],
  );

  const stats = useMemo(() => {
    const total = allSponsors.length;
    const placed = allSponsors.filter(
      (sponsor) => sponsor.isPrimary || sponsor.rank != null,
    ).length;
    const unassigned = allSponsors.filter(
      (sponsor) => !sponsor.isPrimary && sponsor.rank == null,
    ).length;
    const inactive = allSponsors.filter((sponsor) => !sponsor.isActive).length;
    const drafts = allSponsors.filter((sponsor) => sponsor.isDraft).length;

    return {
      total,
      placed,
      unassigned,
      inactive,
      archived: 0,
      drafts,
    };
  }, [allSponsors]);

  function addSponsorDraft() {
    setDraftSponsors((current) => {
      const next = createDraftSponsor(current.length + 1);
      setSelectedSponsorId(next.id);
      return [next, ...current];
    });
    setActiveFilter("all");
    setSearchValue("");
  }

  return {
    isRedirecting:
      !segmentOk || (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)),
    isLoading: q.isPending,
    isError: q.isError,
    errorMessage:
      q.isError && q.error instanceof Error ? q.error.message : AUTH_ERROR_MESSAGES.network,
    sponsors: filteredSponsors,
    allSponsors,
    stats,
    selectedSponsor,
    selectedSponsorId,
    setSelectedSponsorId,
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    addSponsorDraft,
    refetch: q.refetch,
  };
}
