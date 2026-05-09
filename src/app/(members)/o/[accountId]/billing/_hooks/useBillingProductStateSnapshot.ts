"use client";

import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import {
  deriveBillingProductState,
  deriveBillingUiMode,
  type BillingProductState,
  type BillingUiMode,
} from "../_core/billing-state";
import { labelForBillingProductState } from "../_utils/overview/billingProductStateDisplay";

export type BillingProductStateSnapshot =
  | { status: "loading" }
  | { status: "unavailable" }
  | {
      status: "ready";
      billingUiMode: BillingUiMode;
      productState: BillingProductState;
      label: string;
    };

export type UseBillingProductStateSnapshotOptions = {
  enabled?: boolean;
};

/**
 * Fetches billing summary + orders (when summary is ready) and derives the same
 * {@link BillingProductState} / label as the billing page status badge.
 * Use this anywhere you need billing status outside of a badge (headers, menus, tables).
 */
export function useBillingProductStateSnapshot(
  accountId: string,
  options?: UseBillingProductStateSnapshotOptions,
): BillingProductStateSnapshot {
  const segmentOk = isValidAccountIdSegment(accountId);
  const enabled = (options?.enabled ?? true) && segmentOk;

  const q = useAccountBilling(accountId, { enabled });
  const billingReady = Boolean(q.isSuccess && q.data && !isAccountBillingGatewayRedirect(q.data));
  const ordersQ = useAccountBillingOrders(accountId, { enabled: enabled && billingReady });

  if (!segmentOk) {
    return { status: "unavailable" };
  }

  if (q.isPending) {
    return { status: "loading" };
  }

  if (q.isError || !q.data || isAccountBillingGatewayRedirect(q.data)) {
    return { status: "unavailable" };
  }

  if (billingReady && ordersQ.isPending) {
    return { status: "loading" };
  }

  const ordersPayload =
    ordersQ.isSuccess && ordersQ.data && !isAccountBillingOrdersGatewayRedirect(ordersQ.data)
      ? ordersQ.data.orders
      : [];

  const billingUiMode = deriveBillingUiMode(q.data.data, { orders: ordersPayload });
  const productState = deriveBillingProductState(billingUiMode);

  return {
    status: "ready",
    billingUiMode,
    productState,
    label: labelForBillingProductState(productState),
  };
}
