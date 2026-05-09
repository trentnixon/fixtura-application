"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/client/api-error";
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
import { usePostAccountBillingCancelInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingCancelInvoiceRequest";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { useBillingHistoryLifecycle } from "./useBillingHistoryLifecycle";

import type { BillingHistoryState } from "../_types/billingHistory";
import type { InvoiceRequestSummary } from "@/types/api/account";

export function useBillingHistoryContentState(accountId: string): BillingHistoryState {
  const segmentOk = isValidAccountIdSegment(accountId);
  const cancelInvoiceRequestMutation = usePostAccountBillingCancelInvoiceRequest(accountId);
  const [invoiceWithdrawError, setInvoiceWithdrawError] = useState<string | null>(null);

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

  const lifecycle = useBillingHistoryLifecycle({
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
      summary,
      extra: lifecycle.debugExtra,
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
      summary,
      extra: lifecycle.debugExtra,
    };
  }

  if (billingQuery.isError || invoiceRequestsQuery.isError) {
    const error = billingQuery.error ?? invoiceRequestsQuery.error;

    return {
      kind: "load-error",
      accountId,
      summary,
      message: error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.network,
      extra: {
        ...lifecycle.debugExtra,
        billingQueryError: Boolean(billingQuery.isError),
        invoiceRequestsQueryError: Boolean(invoiceRequestsQuery.isError),
      },
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

  async function withdrawInvoiceRequest(request: InvoiceRequestSummary): Promise<void> {
    const rawId = request.invoiceRequestId ?? (request.id != null ? String(request.id) : "");
    const requestId = rawId.trim();
    if (!requestId) return;
    if (!window.confirm("Withdraw this invoice request? You can submit a new one later.")) return;

    setInvoiceWithdrawError(null);

    try {
      await cancelInvoiceRequestMutation.mutateAsync(requestId);
    } catch (error) {
      setInvoiceWithdrawError(
        error instanceof ApiError ? error.message : "Something went wrong. Try again.",
      );
    }
  }

  return {
    kind: "ready",
    accountId,
    summary,
    invoiceRequests,
    orders,
    ordersLoadError,
    invoiceWithdrawError,
    cancelInvoiceRequestPending: cancelInvoiceRequestMutation.isPending,
    baseHref: `/o/${encodeURIComponent(accountId)}/billing`,
    withdrawInvoiceRequest,
    refetchHistory: () => {
      void billingQuery.refetch();
      void invoiceRequestsQuery.refetch();
    },
    refetchOrders: () => void ordersQuery.refetch(),
  };
}
