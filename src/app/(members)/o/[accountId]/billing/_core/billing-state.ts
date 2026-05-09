export type {
  BillingDebugSnapshot,
  BillingProductState,
  BillingUiMode,
  DeriveBillingUiModeOptions,
} from "./_types/billing-state";

export {
  canStartTrial,
  hasPaidActiveOrder,
  hasPaidActiveOrderFromOrderHistory,
  hasPaidPlanWithoutPendingOrder,
  isActiveTrial,
  qualifiesFreeTrialAvailable,
} from "./_utils/billing-state-helpers";
export {
  billingPeriodDaysRemaining,
  billingPeriodElapsedProgressPercent,
  trialDaysRemaining,
  trialElapsedProgressPercent,
} from "./_utils/billing-date-progress";
export { getBillingDebugSnapshot } from "./_utils/billing-state-debug";
export { deriveBillingProductState, deriveBillingUiMode } from "./_utils/billing-state-derivation";
