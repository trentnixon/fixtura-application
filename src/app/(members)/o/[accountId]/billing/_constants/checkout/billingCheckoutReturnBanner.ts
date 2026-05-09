import type { BillingCheckoutReturnOutcome } from "../../_types/checkout/billingCheckoutReturn";

export const BILLING_CHECKOUT_RETURN_BANNER_MESSAGE_BY_OUTCOME: Record<
  BillingCheckoutReturnOutcome,
  string
> = {
  cancelled: "Checkout was cancelled. Refreshing billing statusâ€¦",
  success: "Returning from checkout. Refreshing billing statusâ€¦",
};
