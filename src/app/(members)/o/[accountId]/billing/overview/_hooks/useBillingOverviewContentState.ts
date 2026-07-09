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

export type BillingOverviewContentStateResult = {
  state: BillingOverviewState;
  refetchBilling: () => void;
};

export function useBillingOverviewContentState(
  accountId: string,
): BillingOverviewContentStateResult {
  const segmentOk = isValidAccountIdSegment(accountId);
  const billingQuery = useAccountBilling(accountId, { enabled: segmentOk });
  const refetchBilling = () => void billingQuery.refetch();
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
      state: {
        kind: "invalid-account",
        accountId,
        checkoutReturnNotice: null,
      },
      refetchBilling,
    };
  }

  if (billingQuery.isPending) {
    return {
      state: {
        kind: "billing-loading",
        accountId,
        checkoutReturnNotice,
      },
      refetchBilling,
    };
  }

  if (
    billingQuery.isSuccess &&
    billingQuery.data &&
    isAccountBillingGatewayRedirect(billingQuery.data)
  ) {
    return {
      state: {
        kind: "billing-gateway-redirect",
        accountId,
        checkoutReturnNotice,
        gatewayReason: billingQuery.data.reason,
      },
      refetchBilling,
    };
  }

  if (billingQuery.isError) {
    return {
      state: {
        kind: "billing-error",
        accountId,
        checkoutReturnNotice,
        message:
          billingQuery.error instanceof Error
            ? billingQuery.error.message
            : "A network error occurred while loading billing.",
      },
      refetchBilling,
    };
  }

  if (
    !billingQuery.isSuccess ||
    !billingQuery.data ||
    isAccountBillingGatewayRedirect(billingQuery.data)
  ) {
    return {
      state: {
        kind: "unexpected-empty",
        accountId,
        checkoutReturnNotice,
      },
      refetchBilling,
    };
  }

  const billingSummary = billingQuery.data.data;

  if (ordersQuery.isPending) {
    return {
      state: {
        kind: "orders-loading",
        accountId,
        checkoutReturnNotice,
        billingSummary,
      },
      refetchBilling,
    };
  }

  if (
    ordersQuery.isSuccess &&
    ordersQuery.data &&
    isAccountBillingOrdersGatewayRedirect(ordersQuery.data)
  ) {
    return {
      state: {
        kind: "orders-gateway-redirect",
        accountId,
        checkoutReturnNotice,
        billingSummary,
        gatewayReason: ordersQuery.data.reason,
      },
      refetchBilling,
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
    state: {
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
    },
    refetchBilling,
  };
}
