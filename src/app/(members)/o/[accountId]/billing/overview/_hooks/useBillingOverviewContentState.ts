import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { useBillingOverviewLifecycle } from "./useBillingOverviewLifecycle";
import { deriveBillingUiMode, type BillingUiMode } from "../../_core/billing-state";
import { billingTrialDetailsTriggerState } from "../../trial/billing-trial-details-dialog";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

type BillingOverviewReadyState = {
  kind: "ready";
  accountId: string;
  segmentOk: true;
  checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
  billingSummary: AccountBillingSummaryV1;
  billingUiMode: BillingUiMode;
  ordersPayload: AccountBillingOrderHistoryDto[];
  ordersLoadError: Error | null;
  trialDetailsTrigger: ReturnType<typeof billingTrialDetailsTriggerState>;
  historyHref: string;
  createHref: string;
  availableActions: AccountBillingSummaryV1["availableActions"];
  refetchOrders: () => void;
};

export type BillingOverviewState =
  | {
      kind: "invalid-account";
      accountId: string;
      checkoutReturnNotice: null;
    }
  | {
      kind: "billing-loading";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
    }
  | {
      kind: "billing-gateway-redirect";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
      gatewayReason: string;
    }
  | {
      kind: "billing-error";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
      message: string;
    }
  | {
      kind: "unexpected-empty";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
    }
  | {
      kind: "orders-loading";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
      billingSummary: AccountBillingSummaryV1;
    }
  | {
      kind: "orders-gateway-redirect";
      accountId: string;
      checkoutReturnNotice: ReturnType<typeof useBillingOverviewLifecycle>["checkoutReturnNotice"];
      billingSummary: AccountBillingSummaryV1;
      gatewayReason: string;
    }
  | BillingOverviewReadyState;

export function useBillingOverviewContentState(accountId: string): BillingOverviewState {
  const segmentOk = isValidAccountIdSegment(accountId);
  const billingQuery = useAccountBilling(accountId, { enabled: segmentOk });
  const billingReady = Boolean(
    billingQuery.isSuccess &&
    billingQuery.data &&
    !isAccountBillingGatewayRedirect(billingQuery.data),
  );
  const ordersQuery = useAccountBillingOrders(accountId, { enabled: segmentOk && billingReady });

  const { checkoutReturnNotice } = useBillingOverviewLifecycle({
    accountId,
    segmentOk,
    billingQuery,
    ordersQuery,
  });

  if (!segmentOk) {
    return {
      kind: "invalid-account",
      accountId,
      checkoutReturnNotice: null,
    };
  }

  if (billingQuery.isPending) {
    return {
      kind: "billing-loading",
      accountId,
      checkoutReturnNotice,
    };
  }

  if (
    billingQuery.isSuccess &&
    billingQuery.data &&
    isAccountBillingGatewayRedirect(billingQuery.data)
  ) {
    return {
      kind: "billing-gateway-redirect",
      accountId,
      checkoutReturnNotice,
      gatewayReason: billingQuery.data.reason,
    };
  }

  if (billingQuery.isError) {
    return {
      kind: "billing-error",
      accountId,
      checkoutReturnNotice,
      message:
        billingQuery.error instanceof Error
          ? billingQuery.error.message
          : "A network error occurred while loading billing.",
    };
  }

  if (
    !billingQuery.isSuccess ||
    !billingQuery.data ||
    isAccountBillingGatewayRedirect(billingQuery.data)
  ) {
    return {
      kind: "unexpected-empty",
      accountId,
      checkoutReturnNotice,
    };
  }

  const billingSummary = billingQuery.data.data;

  if (ordersQuery.isPending) {
    return {
      kind: "orders-loading",
      accountId,
      checkoutReturnNotice,
      billingSummary,
    };
  }

  if (
    ordersQuery.isSuccess &&
    ordersQuery.data &&
    isAccountBillingOrdersGatewayRedirect(ordersQuery.data)
  ) {
    return {
      kind: "orders-gateway-redirect",
      accountId,
      checkoutReturnNotice,
      billingSummary,
      gatewayReason: ordersQuery.data.reason,
    };
  }

  const ordersPayload =
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
  const billingUiMode = deriveBillingUiMode(billingSummary, { orders: ordersPayload });

  return {
    kind: "ready",
    accountId,
    segmentOk: true,
    checkoutReturnNotice,
    billingSummary,
    billingUiMode,
    ordersPayload,
    ordersLoadError,
    trialDetailsTrigger: billingTrialDetailsTriggerState(billingSummary, billingUiMode, {
      orders: ordersPayload,
    }),
    historyHref: `/o/${encodeURIComponent(accountId)}/billing/history`,
    createHref: `/o/${encodeURIComponent(accountId)}/billing/create`,
    availableActions: billingSummary.availableActions,
    refetchOrders: () => void ordersQuery.refetch(),
  };
}
