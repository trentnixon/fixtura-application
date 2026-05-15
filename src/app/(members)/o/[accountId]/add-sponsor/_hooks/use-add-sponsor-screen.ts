"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { accountScopedRoutes, isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

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
    isActive: true,
    isPrimary: false,
    rank: null,
    hasLogo: false,
    logoUrl: null,
    logoAlt: null,
    sponsorshipAllocations: [],
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

  useEffect(() => {
    redirectingRef.current = false;
    setSponsor(refreshWorkspaceSponsorDerivedFields(createNewSponsorDraft()));
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

  async function saveSponsor(params: {
    sponsorId: number | string;
    name: string;
    tagline: string | null;
    description: string | null;
    url: string | null;
    isActive: boolean;
    logoFile: File | null;
    clearLogo: boolean;
  }) {
    const created = await accountApi.postAccountSponsor(accountId, {
      name: params.name.trim(),
      tagline: params.tagline,
      description: params.description,
      url: params.url,
      isActive: params.isActive,
    });
    const newId = created.data.id;

    if (params.logoFile) {
      const formData = new FormData();
      formData.append("file", params.logoFile);
      await accountApi.postAccountSponsorLogoUpload(accountId, newId, formData);
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });

    router.replace(accountScopedRoutes.manageSponsors(accountId));
  }

  return {
    isRedirecting:
      !segmentOk || (q.isSuccess && q.data && isAccountSponsorsGatewayRedirect(q.data)),
    isLoading: q.isPending,
    isError: q.isError,
    errorMessage:
      q.isError && q.error instanceof Error ? q.error.message : AUTH_ERROR_MESSAGES.network,
    sponsor,
    saveSponsor,
    refetch: q.refetch,
  };
}
