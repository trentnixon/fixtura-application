import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export type HighlightedHistoryOrderMatchReason =
  | "stripe_subscription_id"
  | "summary_order_id"
  | "is_active_flag"
  | "newest_first"
  | "none";

/** Prefer the billing summary active order, then active flag, then newest (first in list). */
export function resolveHighlightedHistoryOrder(
  orders: AccountBillingOrderHistoryDto[],
  billingActiveOrder: AccountBillingOrderDto | null,
): {
  order: AccountBillingOrderHistoryDto | null;
  matchReason: HighlightedHistoryOrderMatchReason;
} {
  if (orders.length === 0) {
    return { order: null, matchReason: "none" };
  }

  if (billingActiveOrder?.stripe_subscription_id) {
    const subscriptionId = billingActiveOrder.stripe_subscription_id.trim().toLowerCase();
    const subscriptionMatch = orders.find(
      (order) => order.stripeSubscriptionId?.trim().toLowerCase() === subscriptionId,
    );
    if (subscriptionMatch) {
      return { order: subscriptionMatch, matchReason: "stripe_subscription_id" };
    }
  }

  if (billingActiveOrder?.id != null) {
    const idMatch = orders.find((order) => order.id === billingActiveOrder.id);
    if (idMatch) {
      return { order: idMatch, matchReason: "summary_order_id" };
    }
  }

  const activeOrder = orders.find((order) => order.isActive);
  if (activeOrder) {
    return { order: activeOrder, matchReason: "is_active_flag" };
  }

  return { order: orders[0] ?? null, matchReason: "newest_first" };
}

export function pickHighlightedHistoryOrder(
  orders: AccountBillingOrderHistoryDto[],
  billingActiveOrder: AccountBillingOrderDto | null,
): AccountBillingOrderHistoryDto | null {
  return resolveHighlightedHistoryOrder(orders, billingActiveOrder).order;
}
