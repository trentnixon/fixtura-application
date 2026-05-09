import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

/** Prefer the billing summary active order, then active flag, then newest (first in list). */
export function pickHighlightedHistoryOrder(
  orders: AccountBillingOrderHistoryDto[],
  billingActiveOrder: AccountBillingOrderDto | null,
): AccountBillingOrderHistoryDto | null {
  if (orders.length === 0) return null;

  if (billingActiveOrder?.stripe_subscription_id) {
    const subscriptionId = billingActiveOrder.stripe_subscription_id.trim().toLowerCase();
    const subscriptionMatch = orders.find(
      (order) => order.stripeSubscriptionId?.trim().toLowerCase() === subscriptionId,
    );
    if (subscriptionMatch) return subscriptionMatch;
  }

  if (billingActiveOrder?.id != null) {
    const idMatch = orders.find((order) => order.id === billingActiveOrder.id);
    if (idMatch) return idMatch;
  }

  const activeOrder = orders.find((order) => order.isActive);
  if (activeOrder) return activeOrder;

  return orders[0] ?? null;
}
