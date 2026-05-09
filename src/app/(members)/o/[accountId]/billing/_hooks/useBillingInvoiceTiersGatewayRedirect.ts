"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  isAccountBillingAvailableTiersGatewayRedirect,
  type AccountBillingAvailableTiersQueryResult,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { queryKeys } from "@/lib/api/query/query-keys";
import { selectOrganisationUrlWithReason } from "@/lib/config/gateway-reasons";

type UseBillingInvoiceTiersGatewayRedirectArgs = {
  accountId: string;
  enabled: boolean;
  tiersIsSuccess: boolean;
  tiersData: AccountBillingAvailableTiersQueryResult | undefined;
};

/**
 * When available-tiers resolves to a select-org gateway marker, remove the query cache entry and navigate.
 */
export function useBillingInvoiceTiersGatewayRedirect({
  accountId,
  enabled,
  tiersIsSuccess,
  tiersData,
}: UseBillingInvoiceTiersGatewayRedirectArgs): void {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!enabled) return;
    if (!tiersIsSuccess || !tiersData || redirectingRef.current) return;
    if (!isAccountBillingAvailableTiersGatewayRedirect(tiersData)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.billingAvailableTiers(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(tiersData.reason));
  }, [tiersIsSuccess, tiersData, accountId, queryClient, router, enabled]);
}
