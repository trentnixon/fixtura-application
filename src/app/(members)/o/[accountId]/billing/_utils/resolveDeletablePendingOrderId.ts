import { normalizeBillingCode } from "./billingSummaryLabels";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

function isStripeIncompleteCheckout(status: string | null | undefined): boolean {
  return normalizeBillingCode(status ?? "") === "incomplete";
}

/**
 * Resolves Strapi order id for POST …/billing/orders/:orderId/delete.
 *
 * **CMS (current):** discard is Stripe-only: `availableActions.canDeletePendingOrder` is only true for
 * unpaid Stripe orders with `checkout_status: incomplete`. Invoice-channel orders return 409 from delete.
 * Do not use this for member “withdraw invoice request” until CMS extends the contract.
 */
export function resolveDeletablePendingOrderId(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): string | null {
  if (summary.availableActions?.["canDeletePendingOrder"] !== true) {
    return null;
  }

  const plan = summary.currentPlan;
  if (plan?.orderId && plan.paymentChannel === "stripe") {
    return plan.orderId;
  }

  for (const row of orders ?? []) {
    if (
      row.paymentChannel === "stripe" &&
      row.isPaid === false &&
      isStripeIncompleteCheckout(row.checkoutStatus)
    ) {
      return String(row.id);
    }
  }

  return null;
}
