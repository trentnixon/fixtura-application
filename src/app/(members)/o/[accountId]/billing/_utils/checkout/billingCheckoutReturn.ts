import { BILLING_CHECKOUT_RETURN_PARAM } from "../../_constants/checkout/billingCheckoutReturnParams";

import type { BillingCheckoutReturnOutcome } from "../../_types/checkout/billingCheckoutReturn";

/** Read-only search params (e.g. `useSearchParams()` in the App Router). */
export function readBillingCheckoutReturnOutcome(searchParams: {
  get: (name: string) => string | null;
}): BillingCheckoutReturnOutcome | null {
  const sessionId = searchParams.get(BILLING_CHECKOUT_RETURN_PARAM.sessionId)?.trim();
  const checkoutSessionId = searchParams
    .get(BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId)
    ?.trim();
  const billingCheckout = searchParams.get(BILLING_CHECKOUT_RETURN_PARAM.billingCheckout);

  if (billingCheckout === "cancelled") {
    return "cancelled";
  }
  if (billingCheckout === "success") {
    return "success";
  }
  if (sessionId || checkoutSessionId) {
    return "success";
  }
  return null;
}

export function stripBillingCheckoutReturnParams(sp: URLSearchParams): void {
  sp.delete(BILLING_CHECKOUT_RETURN_PARAM.sessionId);
  sp.delete(BILLING_CHECKOUT_RETURN_PARAM.checkoutSessionId);
  sp.delete(BILLING_CHECKOUT_RETURN_PARAM.billingCheckout);
}
