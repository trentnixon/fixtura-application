"use client";

import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingInvoiceRequestsGatewayRedirect,
  useAccountBillingInvoiceRequests,
} from "@/lib/api/hooks/account/useAccountBillingInvoiceRequests";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { useBillingHistoryLifecycle } from "./useBillingHistoryLifecycle";

import type { BillingHistoryState } from "../_types/billingHistory";

export function useBillingHistoryContentState(accountId: string): BillingHistoryState {
  const segmentOk = isValidAccountIdSegment(accountId);

  const billingQuery = useAccountBilling(accountId, { enabled: segmentOk });
  const invoiceRequestsQuery = useAccountBillingInvoiceRequests(accountId, { enabled: segmentOk });

  const billingReady = Boolean(
    billingQuery.isSuccess &&
    billingQuery.data &&
    !isAccountBillingGatewayRedirect(billingQuery.data),
  );
  const invoiceRequestsReady = Boolean(
    invoiceRequestsQuery.isSuccess &&
    invoiceRequestsQuery.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data),
  );
  const ordersQuery = useAccountBillingOrders(accountId, {
    enabled: segmentOk && billingReady && invoiceRequestsReady,
  });

  useBillingHistoryLifecycle({
    accountId,
    segmentOk,
    billingQuery,
    invoiceRequestsQuery,
    ordersQuery,
  });

  if (!segmentOk) {
    return {
      kind: "invalid-account",
      accountId,
    };
  }

  const summary =
    billingQuery.isSuccess &&
    billingQuery.data &&
    !isAccountBillingGatewayRedirect(billingQuery.data)
      ? billingQuery.data.data
      : null;

  if (
    billingQuery.isPending ||
    invoiceRequestsQuery.isPending ||
    (segmentOk && billingReady && invoiceRequestsReady && ordersQuery.isPending)
  ) {
    return {
      kind: "loading",
      accountId,
    };
  }

  if (
    (billingQuery.isSuccess &&
      billingQuery.data &&
      isAccountBillingGatewayRedirect(billingQuery.data)) ||
    (invoiceRequestsQuery.isSuccess &&
      invoiceRequestsQuery.data &&
      isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)) ||
    (ordersQuery.isSuccess &&
      ordersQuery.data &&
      isAccountBillingOrdersGatewayRedirect(ordersQuery.data))
  ) {
    return {
      kind: "redirecting",
      accountId,
    };
  }

  if (billingQuery.isError || invoiceRequestsQuery.isError) {
    const error = billingQuery.error ?? invoiceRequestsQuery.error;

    return {
      kind: "load-error",
      accountId,
      message: error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.network,
      refetchHistory: () => {
        void billingQuery.refetch();
        void invoiceRequestsQuery.refetch();
      },
    };
  }

  const invoiceRequests =
    invoiceRequestsQuery.isSuccess &&
    invoiceRequestsQuery.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)
      ? invoiceRequestsQuery.data.invoiceRequests
      : [];

  const orders =
    ordersQuery.isSuccess &&
    ordersQuery.data &&
    !isAccountBillingOrdersGatewayRedirect(ordersQuery.data)
      ? ordersQuery.data.orders
      : [];

  const ordersLoadError = ordersQuery.isError
    ? ordersQuery.error instanceof Error
      ? ordersQuery.error
      : new Error(String(ordersQuery.error))
    : null;

  if (!summary) {
    return {
      kind: "load-error",
      accountId,
      message: AUTH_ERROR_MESSAGES.network,
      refetchHistory: () => {
        void billingQuery.refetch();
        void invoiceRequestsQuery.refetch();
      },
    };
  }

  return {
    kind: "ready",
    accountId,
    summary,
    invoiceRequests,
    orders,
    ordersLoadError,
    baseHref: `/o/${encodeURIComponent(accountId)}/billing`,
    refetchHistory: () => {
      void billingQuery.refetch();
      void invoiceRequestsQuery.refetch();
    },
    refetchOrders: () => void ordersQuery.refetch(),
  };
}
