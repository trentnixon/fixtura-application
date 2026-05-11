"use client";

/**
 * Legacy inline checkout surface. `/billing/create` is the canonical Season Pass purchase route.
 * This barrel remains for compatibility with older imports and shared action-gate exports.
 */
export { BillingPlanCheckout } from "./_components/BillingPlanCheckout";
export { shouldShowPlanCheckout } from "../_utils/create-subscription/checkoutActionGate";
export type { BillingPlanCheckoutProps } from "./_types/billingPlanCheckout";
