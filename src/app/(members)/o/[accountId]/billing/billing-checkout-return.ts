/**
 * Query parameters the billing page recognises after Stripe Checkout (success/cancel).
 * Strapi/Stripe should set success_url and cancel_url to this app’s billing route with one of these patterns.
 *
 * @see src/app/(members)/o/[accountId]/billing/.comms/billing-checkout-return-urls.md
 */

export const BILLING_CHECKOUT_RETURN_PARAM = {
  /** Common Stripe success_url query name when using `?session_id={CHECKOUT_SESSION_ID}` */
  sessionId: "session_id",
  /** Alternative name if the backend emits it */
  checkoutSessionId: "checkout_session_id",
  /** Explicit outcome: `success` | `cancelled` — set by CMS if not using session_id */
  billingCheckout: "billing_checkout",
} as const;

export type BillingCheckoutReturnOutcome = "success" | "cancelled";

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
