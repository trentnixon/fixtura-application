"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { queryKeys } from "@/lib/api/query/query-keys";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { brandingScreenViewFromQuery } from "../_utils";

import type { BrandingScreenView } from "../_types";

export function useBrandingScreen(accountId: string): BrandingScreenView {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const branding = useAccountBranding(accountId, { enabled: segmentOk });

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
    if (!branding.isSuccess || !branding.data || redirectingRef.current) return;
    if (!isAccountBrandingGatewayRedirect(branding.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.branding(accountId) });
    router.replace(selectOrganisationUrlWithReason(branding.data.reason));
  }, [accountId, branding.isSuccess, branding.data, queryClient, router, segmentOk]);

  return brandingScreenViewFromQuery({
    segmentOk,
    isPending: branding.isPending,
    isSuccess: branding.isSuccess,
    isError: branding.isError,
    data: branding.data,
    error: branding.error,
    onRetry: () => void branding.refetch(),
  });
}
