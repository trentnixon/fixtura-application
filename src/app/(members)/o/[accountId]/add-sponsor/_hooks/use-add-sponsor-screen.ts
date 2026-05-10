"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

import { upsertLocalSponsor } from "../../manage-sponsors/_utils/local-sponsor-storage";
import { refreshWorkspaceSponsorDerivedFields } from "../../manage-sponsors/_utils/sponsor-display";

import type { ManageSponsorsWorkspaceSponsor } from "../../manage-sponsors/_types/manage-sponsors";

function createNewSponsorDraft(): ManageSponsorsWorkspaceSponsor {
  const nonce = Date.now();

  return {
    id: `local-${nonce}`,
    name: "New sponsor",
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
    usageLabel: "Pool only",
    isDraft: true,
  };
}

export function useAddSponsorScreen(accountId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const q = useAccountSponsors(accountId, { enabled: segmentOk });
  const [sponsor, setSponsor] = useState<ManageSponsorsWorkspaceSponsor>(() =>
    refreshWorkspaceSponsorDerivedFields(createNewSponsorDraft()),
  );
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    redirectingRef.current = false;
    setSponsor(refreshWorkspaceSponsorDerivedFields(createNewSponsorDraft()));
    setIsCreated(false);
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

  function saveSponsor(params: {
    sponsorId: number | string;
    name: string;
    tagline: string | null;
    description: string | null;
    url: string | null;
    isActive: boolean;
    logoFile: File | null;
    clearLogo: boolean;
  }) {
    let nextLogoUrl = sponsor.logoUrl;
    let nextHasLogo = sponsor.hasLogo;

    if (params.clearLogo) {
      nextLogoUrl = null;
      nextHasLogo = false;
    } else if (params.logoFile) {
      nextLogoUrl = URL.createObjectURL(params.logoFile);
      nextHasLogo = true;
    }

    const nextSponsor = refreshWorkspaceSponsorDerivedFields({
      ...sponsor,
      id: sponsor.id,
      name: params.name.trim(),
      tagline: params.tagline,
      description: params.description,
      url: params.url,
      isActive: params.isActive,
      hasLogo: nextHasLogo,
      logoUrl: nextLogoUrl,
      logoAlt: params.name.trim() || sponsor.logoAlt,
      isDraft: false,
    });

    setSponsor(nextSponsor);
    upsertLocalSponsor(accountId, nextSponsor);
    setIsCreated(true);
  }

  return {
    isRedirecting:
      !segmentOk || (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)),
    isLoading: q.isPending,
    isError: q.isError,
    errorMessage:
      q.isError && q.error instanceof Error ? q.error.message : AUTH_ERROR_MESSAGES.network,
    sponsor,
    isCreated,
    saveSponsor,
    refetch: q.refetch,
  };
}
