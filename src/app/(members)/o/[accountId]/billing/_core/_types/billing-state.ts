import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";
import type { AccountBillingOrderHistoryDto } from "@/types/api/account";

/**
 * Derived presentation mode from GET billing summary (`AccountBillingSummaryV1`).
 * Note: docs may say `trial_active` for running trial; here that is `active_trial`.
 */
export type BillingUiMode =
  | "free_trial_available"
  | "active_trial"
  | "trial_expired"
  | "paid_active"
  | "payment_pending"
  | "access_denied"
  | "no_billing"
  | "unknown";

/**
 * Product language bucket for copy/analytics/tests
 * (see `.comms/planning/billing-ui-states-routes-wizard-llm-integration.md`).
 * Differs slightly from BillingUiMode: access_denied/unknown route to restrictive messaging, not funnel.
 */
export type BillingProductState =
  | "activate_trial"
  | "active_account"
  | "pending"
  | "create_subscription"
  | "access_uncertain";

export type DeriveBillingUiModeOptions = {
  /** Defaults to runtime `new Date()`; inject in tests for stable behaviour. */
  referenceDate?: Date;
  /**
   * GET /billing may omit `activeOrder` while GET /api/orders/account/:id exposes `checkoutStatus`
   * (e.g. `invoice_issued`). Pass the same order list used on the overview to align pending detection.
   */
  orders?: AccountBillingOrderHistoryDto[] | null;
};

/** Dev-only structured view of billing inputs, intermediate flags, and derived modes. */
export type BillingDebugSnapshot = {
  referenceIso: string;
  billingUiMode: BillingUiMode;
  billingProductState: BillingProductState;
  derivationFlags: {
    /** Resolved UI: `deriveBillingUiMode` is `payment_pending` (banner + funnel treat account as awaiting payment). */
    uiModeIsPaymentPending: boolean;
    /**
     * Incomplete `activeOrder`, or order-history rows signalling unpaid/pending checkout (see `hasPaymentPending`).
     * `latestInvoiceRequest.status` alone does not set this flag.
     */
    payloadHasPaymentPendingSignals: boolean;
    /** `paid_active` UI while `payloadHasPaymentPendingSignals` is still true (e.g. order/checkout still unresolved). */
    paidActiveDespitePendingSignalsInPayload: boolean;
    /** Paid entitlement from `summary.activeOrder` (not from GET /orders list). */
    paidEntitlementFromSummaryActiveOrder: boolean;
    /** At least one GET /orders row is `isPaid` + `isActive` (summary may omit `activeOrder`). */
    paidEntitlementFromOrderHistory: boolean;
    /** `currentPlan` / billing+access codes say paid without an unresolved order (see `hasPaidPlanWithoutPendingOrder`). */
    paidEntitlementFromPlanOrBillingState: boolean;
    /** Would show free-trial start funnel (`qualifiesFreeTrialAvailable`). */
    qualifiesForFreeTrialStart: boolean;
    /** Trial treated as running for UI (`isActiveTrial`). */
    trialIsActiveForUi: boolean;
    /** Preconditions met for the `trial_expired` branch before later rules (step 5 in `deriveBillingUiMode`). */
    trialExpiredBranchPreconditionsMet: boolean;
    /** Denied access or unpaid/past_due without active trial (`isAccessDenied`). */
    accessDeniedOrUnpaidStress: boolean;
    /** Empty portfolio branch inputs (`isEmptyBillingPortfolio`). */
    billingPortfolioIsEmpty: boolean;
  };
  summarySlice: {
    billingStatus: string;
    accessStatus: string;
    currentPlanId: string | number | null;
    trialRowPresent: boolean;
    trialIsActive: boolean | null | undefined;
    trialEndDate: string | null | undefined;
    activeOrderPresent: boolean;
    orderStripeStatus: string | null;
    orderPaymentStatus: string | null;
    orderCheckoutStatus: string | null;
    orderIsActive: boolean | null | undefined;
    orderCancelAtPeriodEnd: boolean | null | undefined;
    latestInvoiceRequestStatus: string | null | undefined;
    /** `availableActions` keys that are `true` (exactly as returned by the API). */
    availableActionsTrueFromApi: string[];
    /** Same as above after overview UI gate (e.g. invoice action keys hidden when `paid_active`). */
    availableActionsTrueShownInOverview: string[];
    /** Any GET /orders (or summary active order) satisfies invoice awaiting-payment AND. */
    ordersHaveInvoiceIssuedCheckout: boolean;
    /** Contradictory invoice/order field combinations (fail-closed; no unlock). */
    invoiceOrderInconsistent: boolean;
    invoiceOrderAwaitingPayment: boolean;
    invoiceOrderPaidActive: boolean;
    invoiceOrderCancelled: boolean;
  };
  helpers: {
    canStartTrial: boolean;
    trialDaysRemaining: number | null;
  };
  organisationTrial: {
    presentation: OrganisationTrialPresentation;
    failClosed: boolean;
    reason: string | null;
    consumptionStatus: string | null;
    allocationStatus: string | null;
    orgCanStartTrial: boolean | null;
    actionsCanStartTrial: boolean;
    actionFlagsConsistent: boolean;
  };
};
