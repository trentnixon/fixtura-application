/**
 * Query parameters the billing page recognises after Stripe Checkout (success/cancel).
 * Strapi/Stripe should set success_url and cancel_url per `.comms/resources/billing-checkout-return-urls.md`
 * (e.g. success may use `/o/<accountId>/billing/success`; cancel may use `/o/<accountId>/billing/cancel` â†’ redirect to `billing_checkout=cancelled`).
 *
 * @see src/app/(members)/o/[accountId]/billing/.comms/resources/billing-checkout-return-urls.md
 */
export const BILLING_CHECKOUT_RETURN_PARAM = {
  /** Common Stripe success_url query name when using `?session_id={CHECKOUT_SESSION_ID}` */
  sessionId: "session_id",
  /** Alternative name if the backend emits it */
  checkoutSessionId: "checkout_session_id",
  /** Explicit outcome: `success` | `cancelled` â€” set by CMS if not using session_id */
  billingCheckout: "billing_checkout",
} as const;
