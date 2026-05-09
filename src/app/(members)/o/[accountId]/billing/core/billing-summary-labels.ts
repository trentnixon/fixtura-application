/**
 * Billing summary label helpers — maps API codes to readable copy.
 * Implementation lives under `_constants`, `_types`, and `_utils`.
 */

export { BILLING_AVAILABLE_ACTION_LABELS } from "../_constants/billingSummaryLabels";
export type { BillingAccessBadgeVariant } from "../_types/billingSummaryLabels";
export {
  accessStatusBadgeVariant,
  labelForAccessStatus,
  labelForAvailableAction,
  labelForBillingStatus,
  normalizeBillingCode,
} from "../_utils/billingSummaryLabels";
