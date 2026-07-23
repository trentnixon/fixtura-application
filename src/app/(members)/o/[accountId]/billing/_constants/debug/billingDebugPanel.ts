import type { BillingDebugSnapshot } from "../../_core/billing-state";

export const BILLING_DEBUG_PANEL_SHELL_CLASS =
  "rounded-lg border border-emerald-900/50 bg-black/90 font-mono text-[11px] text-emerald-300 shadow-lg backdrop-blur-sm";

export const BILLING_DEBUG_DERIVATION_FLAG_KEYS = [
  "uiModeIsPaymentPending",
  "payloadHasPaymentPendingSignals",
  "paidActiveDespitePendingSignalsInPayload",
  "paidEntitlementFromSummaryActiveOrder",
  "paidEntitlementFromOrderHistory",
  "paidEntitlementFromPlanOrBillingState",
  "qualifiesForFreeTrialStart",
  "trialIsActiveForUi",
  "trialExpiredBranchPreconditionsMet",
  "accessDeniedOrUnpaidStress",
  "billingPortfolioIsEmpty",
] as const satisfies readonly (keyof BillingDebugSnapshot["derivationFlags"])[];

export const BILLING_DEBUG_SUMMARY_SLICE_KEYS = [
  "billingStatus",
  "accessStatus",
  "currentPlanId",
  "trialRowPresent",
  "trialIsActive",
  "trialEndDate",
  "activeOrderPresent",
  "orderStripeStatus",
  "orderPaymentStatus",
  "orderCheckoutStatus",
  "orderIsActive",
  "orderCancelAtPeriodEnd",
  "latestInvoiceRequestStatus",
  "availableActionsTrueFromApi",
  "availableActionsTrueShownInOverview",
  "ordersHaveInvoiceIssuedCheckout",
] as const satisfies readonly (keyof BillingDebugSnapshot["summarySlice"])[];

export const BILLING_DEBUG_ORG_TRIAL_KEYS = [
  "presentation",
  "failClosed",
  "reason",
  "consumptionStatus",
  "allocationStatus",
  "orgCanStartTrial",
  "actionsCanStartTrial",
  "actionFlagsConsistent",
] as const satisfies readonly (keyof BillingDebugSnapshot["organisationTrial"])[];
