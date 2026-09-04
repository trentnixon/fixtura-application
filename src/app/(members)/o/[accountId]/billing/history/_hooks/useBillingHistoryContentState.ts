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
import { useSupportView } from "@/lib/support/support-view-context";

import { useBillingHistoryLifecycle } from "./useBillingHistoryLifecycle";
import { resolveBillingHistoryInvoiceRequests } from "../../_utils/support/resolveBillingHistoryInvoiceRequests";

import type { BillingHistoryState } from "../_types/billingHistory";

export function useBillingHistoryContentState(accountId: string): BillingHistoryState {
  const segmentOk = isValidAccountIdSegment(accountId);
  const { isSupportView } = useSupportView();
  const invoiceRequestsQueryEnabled = segmentOk;

  const billingQuery = useAccountBilling(accountId, { enabled: segmentOk });
  const invoiceRequestsQuery = useAccountBillingInvoiceRequests(accountId, {
    enabled: invoiceRequestsQueryEnabled,
  });

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
  const ordersQueryEnabled = segmentOk && billingReady && (isSupportView || invoiceRequestsReady);
  const ordersQuery = useAccountBillingOrders(accountId, {
    enabled: ordersQueryEnabled,
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

  const waitingForInvoiceRequests = invoiceRequestsQueryEnabled && invoiceRequestsQuery.isPending;
  const waitingForOrders = ordersQueryEnabled && ordersQuery.isPending;

  if (billingQuery.isPending || waitingForInvoiceRequests || waitingForOrders) {
    return {
      kind: "loading",
      accountId,
    };
  }

  if (
    (billingQuery.isSuccess &&
      billingQuery.data &&
      isAccountBillingGatewayRedirect(billingQuery.data)) ||
    (invoiceRequestsQueryEnabled &&
      invoiceRequestsQuery.isSuccess &&
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

  if (billingQuery.isError || (invoiceRequestsQueryEnabled && invoiceRequestsQuery.isError)) {
    const error = billingQuery.error ?? invoiceRequestsQuery.error;

    return {
      kind: "load-error",
      accountId,
      message: error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.network,
      refetchHistory: () => {
        void billingQuery.refetch();
        if (invoiceRequestsQueryEnabled) {
          void invoiceRequestsQuery.refetch();
        }
      },
    };
  }

  const listFromQuery =
    invoiceRequestsQuery.isSuccess &&
    invoiceRequestsQuery.data &&
    !isAccountBillingInvoiceRequestsGatewayRedirect(invoiceRequestsQuery.data)
      ? invoiceRequestsQuery.data.invoiceRequests
      : [];

  const invoiceRequests = resolveBillingHistoryInvoiceRequests({
    listFromQuery,
  });

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
        if (invoiceRequestsQueryEnabled) {
          void invoiceRequestsQuery.refetch();
        }
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
    isSupportView,
    baseHref: `/o/${encodeURIComponent(accountId)}/billing`,
    refetchHistory: () => {
      void billingQuery.refetch();
      if (invoiceRequestsQueryEnabled) {
        void invoiceRequestsQuery.refetch();
      }
    },
    refetchOrders: () => void ordersQuery.refetch(),
  };
}
