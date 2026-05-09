import { useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  isAccountBillingGatewayRedirect,
  type AccountBillingQueryResult,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingInvoiceRequestsGatewayRedirect,
  type AccountBillingInvoiceRequestsQueryResult,
} from "@/lib/api/hooks/account/useAccountBillingInvoiceRequests";
import {
  isAccountBillingOrdersGatewayRedirect,
  type AccountBillingOrdersQueryResult,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { queryKeys } from "@/lib/api/query/query-keys";
import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";

import type { BillingHistoryDebugExtra } from "../_types/billingHistory";

type UseBillingHistoryLifecycleArgs = {
  accountId: string;
  segmentOk: boolean;
  billingQuery: UseQueryResult<AccountBillingQueryResult>;
  invoiceRequestsQuery: UseQueryResult<AccountBillingInvoiceRequestsQueryResult>;
  ordersQuery: UseQueryResult<AccountBillingOrdersQueryResult>;
};

export type BillingHistoryLifecycleState = {
  debugExtra: BillingHistoryDebugExtra;
};

export function useBillingHistoryLifecycle({
  accountId,
  segmentOk,
  billingQuery,
  invoiceRequestsQuery,
  ordersQuery,
}: UseBillingHistoryLifecycleArgs): BillingHistoryLifecycleState {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);

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
    if (!billingQuery.isSuccess || !billingQuery.data || redirectingRef.current) return;
    if (!isAccountBillingGatewayRedirect(billingQuery.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billing(accountId) });
    router.replace(selectOrganisationUrlWithReason(billingQuery.data.reason));
  }, [accountId, billingQuery.data, billingQuery.isSuccess, queryClient, router, segmentOk]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!invoiceRequestsQuery.isSuccess || !invoiceRequestsQuery.data || redirectingRef.current)
      return;
    if (!isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({
      queryKey: queryKeys.account.billingInvoiceRequests(accountId),
    });
    router.replace(selectOrganisationUrlWithReason(invoiceRequestsQuery.data.reason));
  }, [
    accountId,
    invoiceRequestsQuery.data,
    invoiceRequestsQuery.isSuccess,
    queryClient,
    router,
    segmentOk,
  ]);

  useEffect(() => {
    if (!segmentOk) return;
    if (!ordersQuery.isSuccess || !ordersQuery.data || redirectingRef.current) return;
    if (!isAccountBillingOrdersGatewayRedirect(ordersQuery.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    router.replace(selectOrganisationUrlWithReason(ordersQuery.data.reason));
  }, [accountId, ordersQuery.data, ordersQuery.isSuccess, queryClient, router, segmentOk]);

  const debugExtra = !segmentOk
    ? { validAccountSegment: false }
    : billingQuery.isSuccess &&
        billingQuery.data &&
        isAccountBillingGatewayRedirect(billingQuery.data)
      ? { gateway: billingQuery.data.reason }
      : invoiceRequestsQuery.isSuccess &&
          invoiceRequestsQuery.data &&
          isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)
        ? { invoiceRequestsGateway: invoiceRequestsQuery.data.reason }
        : ordersQuery.isSuccess &&
            ordersQuery.data &&
            isAccountBillingOrdersGatewayRedirect(ordersQuery.data)
          ? { ordersGateway: ordersQuery.data.reason }
          : billingQuery.isPending || invoiceRequestsQuery.isPending
            ? {
                billingPending: billingQuery.isPending,
                invoiceRequestsPending: invoiceRequestsQuery.isPending,
              }
            : ordersQuery.isPending
              ? { ordersPending: true }
              : {};

  return {
    debugExtra,
  };
}
