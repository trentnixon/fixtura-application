import type { BillingCheckoutReturnOutcome } from "../_types/billingCheckoutReturn";

export const BILLING_CHECKOUT_RETURN_BANNER_MESSAGE_BY_OUTCOME: Record<
  BillingCheckoutReturnOutcome,
  string
> = {
  cancelled: "Checkout was cancelled. Refreshing billing status…",
  success: "Returning from checkout. Refreshing billing status…",
};
