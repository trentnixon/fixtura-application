import { useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  isAccountBillingGatewayRedirect,
  type AccountBillingQueryResult,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  type AccountBillingOrdersQueryResult,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { queryKeys } from "@/lib/api/query/query-keys";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import {
  readBillingCheckoutReturnOutcome,
  stripBillingCheckoutReturnParams,
  type BillingCheckoutReturnOutcome,
} from "../core/billing-checkout-return";

type UseBillingOverviewLifecycleArgs = {
  accountId: string;
  segmentOk: boolean;
  billingQuery: UseQueryResult<AccountBillingQueryResult>;
  ordersQuery: UseQueryResult<AccountBillingOrdersQueryResult>;
};

export function useBillingOverviewLifecycle({
  accountId,
  segmentOk,
  billingQuery: q,
  ordersQuery: ordersQ,
}: UseBillingOverviewLifecycleArgs): { checkoutReturnNotice: BillingCheckoutReturnOutcome | null } {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const stripeReturnSignatureRef = useRef<string | null>(null);
  const [checkoutReturnNotice, setCheckoutReturnNotice] =
    useState<BillingCheckoutReturnOutcome | null>(null);

  useEffect(() => {
    redirectingRef.current = false;
    stripeReturnSignatureRef.current = null;
  }, [accountId]);

  useEffect(() => {
    if (!segmentOk) return;
    const outcome = readBillingCheckoutReturnOutcome(searchParams);
    if (outcome == null) return;

    const signature = searchParams.toString();
    if (stripeReturnSignatureRef.current === signature) return;
    stripeReturnSignatureRef.current = signature;

    setCheckoutReturnNotice(outcome);

    const sp = new URLSearchParams(searchParams.toString());
    stripBillingCheckoutReturnParams(sp);
    const qs = sp.toString();
    const path = `/o/${encodeURIComponent(accountId)}/billing${qs ? `?${qs}` : ""}`;

    void queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.account.billingAvailableTiers(accountId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.account.billingInvoiceRequests(accountId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    router.replace(path);
  }, [segmentOk, accountId, queryClient, router, searchParams]);

  useEffect(() => {
    if (!checkoutReturnNotice) return;
    if (!q.isFetching && !ordersQ.isFetching) {
      setCheckoutReturnNotice(null);
    }
  }, [checkoutReturnNotice, q.isFetching, ordersQ.isFetching]);

  useEffect(() => {
    if (segmentOk || redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace(selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg));
  }, [segmentOk, router]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountBillingGatewayRedirect(q.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billing(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [q.isSuccess, q.data, accountId, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!ordersQ.isSuccess || !ordersQ.data || redirectingRef.current) return;
    if (!isAccountBillingOrdersGatewayRedirect(ordersQ.data)) return;
    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    router.replace(selectOrganisationUrlWithReason(ordersQ.data.reason));
  }, [ordersQ.isSuccess, ordersQ.data, accountId, queryClient, router, segmentOk]);

  return { checkoutReturnNotice };
}
