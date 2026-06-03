"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";
import { queryKeys } from "@/lib/api/query/query-keys";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import { bundlesScreenViewFromQuery, resolveBundlesScreenErrorDescription } from "../_utils";

import type { BundlesScreenView } from "../_types";

export function useBundlesScreen(accountId: string): BundlesScreenView {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const segmentOk = isValidAccountIdSegment(accountId);
  const scheduler = useAccountScheduler(accountId, { enabled: segmentOk });

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
    if (!scheduler.isSuccess || !scheduler.data || redirectingRef.current) return;
    if (!isAccountSchedulerGatewayRedirect(scheduler.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.scheduler(accountId) });
    router.replace(selectOrganisationUrlWithReason(scheduler.data.reason));
  }, [accountId, queryClient, router, segmentOk, scheduler.data, scheduler.isSuccess]);

  return bundlesScreenViewFromQuery({
    segmentOk,
    isPending: scheduler.isPending,
    isSuccess: scheduler.isSuccess,
    isError: scheduler.isError,
    data: scheduler.data,
    errorMessage: resolveBundlesScreenErrorDescription(scheduler.error),
    onRetry: () => void scheduler.refetch(),
  });
}
