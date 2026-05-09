/**
 * Checkout return query handling for Stripe → billing route.
 * Implementation lives under `_constants`, `_types`, and `_utils`.
 *
 * @see src/app/(members)/o/[accountId]/billing/.comms/resources/billing-checkout-return-urls.md
 */

export { BILLING_CHECKOUT_RETURN_PARAM } from "../_constants/billingCheckoutReturnParams";
export type { BillingCheckoutReturnOutcome } from "../_types/billingCheckoutReturn";
export {
  readBillingCheckoutReturnOutcome,
  stripBillingCheckoutReturnParams,
} from "../_utils/billingCheckoutReturn";
