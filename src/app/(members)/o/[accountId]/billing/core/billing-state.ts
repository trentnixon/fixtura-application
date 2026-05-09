import { trueAvailableActionKeysAfterBillingUiMode } from "../_utils/availableActionsUiGate";
import { normalizeBillingCode } from "../_utils/billingSummaryLabels";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

/**
 * Derived presentation mode from GET billing summary (`AccountBillingSummaryV1`).
 * Note: docs may say `trial_active` for running trial; here that is **`active_trial`**.
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
 * Product language bucket for copy/analytics/tests (see `.comms/planning/billing-ui-states-routes-wizard-llm-integration.md`).
 * Differs slightly from BillingUiMode: access_denied/unknown route to restrictive messaging, not funnel.
 */
export type BillingProductState =
  | "activate_trial"
  | "active_account"
  | "pending"
  | "create_subscription"
  | "access_uncertain";

export function deriveBillingProductState(mode: BillingUiMode): BillingProductState {
  switch (mode) {
    case "free_trial_available":
      return "activate_trial";
    case "active_trial":
    case "paid_active":
      return "active_account";
    case "payment_pending":
      return "pending";
    case "trial_expired":
    case "no_billing":
      return "create_subscription";
    case "access_denied":
    case "unknown":
      return "access_uncertain";
  }
}

/** Billing status CMS uses before user starts an eligible free trial (`POST …/billing/start-trial`). */
const BILLING_STATUS_TRIAL_AVAILABLE = "trial_available";

export type DeriveBillingUiModeOptions = {
  /** Defaults to runtime `new Date()`; inject in tests for stable behaviour. */
  referenceDate?: Date;
  /**
   * GET /billing may omit `activeOrder` while GET /api/orders/account/:id exposes `checkoutStatus`
   * (e.g. `invoice_issued`). Pass the same order list used on the overview to align pending detection.
   */
  orders?: AccountBillingOrderHistoryDto[] | null;
};

const BILLING_STATUS_TRIAL = new Set<string>(["trial", "trialing", "active_trial", "free_trial"]);

const ACCESS_STATUS_TRIAL = new Set<string>(["trial", "trial_access"]);

const ORDER_STRIPE_PENDING = new Set<string>([
  "incomplete",
  "incomplete_expired",
  "requires_payment_method",
  "requires_action",
  "requires_confirmation",
]);

const ORDER_PAYMENT_PENDING = new Set<string>(["unpaid", "pending", "processing"]);

const ACCESS_DENIED_CODES = new Set<string>(["denied", "locked", "none"]);

const BILLING_UNPAID_STRESS = new Set<string>(["unpaid", "past_due"]);

/**
 * Explicit CMS permission only — missing `{}` actions does **not** allow starting a trial.
 */
export function canStartTrial(actions?: Partial<Record<string, boolean>>): boolean {
  if (actions == null) {
    return false;
  }
  if (Object.keys(actions).length === 0) {
    return false;
  }
  return actions["canStartTrial"] === true || actions["can_start_trial"] === true;
}

function normalizedStatus(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return normalizeBillingCode(value);
}

function parseInstant(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function orderHistoryRowIndicatesPaymentPending(row: AccountBillingOrderHistoryDto): boolean {
  const stripe = normalizedStatus(row.stripeStatus ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) {
    return true;
  }
  const pay = normalizedStatus(row.paymentStatus ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
    return true;
  }
  const checkout = normalizedStatus(row.checkoutStatus ?? "");
  if (
    checkout === "open" ||
    checkout === "incomplete" ||
    checkout === "invoice_issued" ||
    checkout.includes("pending")
  ) {
    return true;
  }
  return false;
}

function hasPaymentPendingFromOrderHistory(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): boolean {
  if (!orders?.length) {
    return false;
  }
  return orders.some(orderHistoryRowIndicatesPaymentPending);
}

/**
 * True when `activeOrder` has Stripe/payment/checkout fields that imply checkout or payment still in flight.
 * Does not inspect `latestInvoiceRequest` — stale `submitted` without any order/checkout signal is ignored in `hasPaymentPending`.
 */
function activeOrderIndicatesPaymentPending(
  o: NonNullable<AccountBillingSummaryV1["activeOrder"]>,
): boolean {
  const stripe = normalizedStatus(o.stripe_status ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) {
    return true;
  }

  const pay = normalizedStatus(o.payment_status ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
    return true;
  }

  const checkout = normalizedStatus(o.checkout_status ?? "");
  if (
    checkout === "open" ||
    checkout === "incomplete" ||
    checkout === "invoice_issued" ||
    checkout.includes("pending")
  ) {
    return true;
  }

  return false;
}

function hasPaymentPending(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): boolean {
  const o = summary.activeOrder;
  if (o && activeOrderIndicatesPaymentPending(o)) {
    return true;
  }

  if (hasPaymentPendingFromOrderHistory(options?.orders)) {
    return true;
  }

  /* latestInvoiceRequest no longer drives payment_pending on its own: requires corroborating
   * `activeOrder` or order-history pending signals (above). CMS can leave status `submitted` after fulfilment.
   */

  return false;
}

/**
 * Paid subscription context from CMS when no `activeOrder` row is present yet.
 * Skipped during active trial so mis-set `currentPlan` does not flip the UI to paid.
 */
export function hasPaidPlanWithoutPendingOrder(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): boolean {
  if (summary.currentPlan == null || isActiveTrial(summary, options)) {
    return false;
  }

  const bill = normalizedStatus(summary.billingStatus);
  if (bill && (BILLING_STATUS_TRIAL.has(bill) || bill.includes("trial"))) {
    return false;
  }

  const billingPaidSignals = new Set(["active", "paid", "paid_active"]);
  const access = normalizedStatus(summary.accessStatus);
  const accessPaidSignals = new Set(["granted", "full", "active"]);

  if (billingPaidSignals.has(bill)) {
    return true;
  }
  if (accessPaidSignals.has(access)) {
    return true;
  }

  return false;
}

/**
 * Paid entitlement on file — conservative so incomplete checkout rows favour `payment_pending` instead.
 */
export function hasPaidActiveOrder(summary: AccountBillingSummaryV1): boolean {
  const o = summary.activeOrder;
  if (!o) {
    return false;
  }

  if (o.isActive === true) {
    const stripe = normalizedStatus(o.stripe_status ?? "");
    if (stripe && (ORDER_STRIPE_PENDING.has(stripe) || ORDER_PAYMENT_PENDING.has(stripe))) {
      return false;
    }
    const pay = normalizedStatus(o.payment_status ?? "");
    if (pay && (ORDER_PAYMENT_PENDING.has(pay) || pay === "incomplete")) {
      return false;
    }
    return true;
  }

  if (o.OrderPaid === true) {
    return true;
  }

  const stripe = normalizedStatus(o.stripe_status ?? "");
  if (stripe === "active" || stripe === "trialing") {
    return true;
  }

  return false;
}

/**
 * True when GET /orders includes at least one row that CMS marks as paid and active (strict booleans).
 * Used when billing summary omits `activeOrder` but order history is current — can override stale
 * `latestInvoiceRequest` pending (e.g. still `submitted` after payment).
 */
export function hasPaidActiveOrderFromOrderHistory(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): boolean {
  if (!orders?.length) {
    return false;
  }
  return orders.some((row) => row.isPaid === true && row.isActive === true);
}

/**
 * Trial is “active” for UI purposes: CMS flag, known status codes, or future end date when not explicitly inactive.
 */
export function isActiveTrial(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): boolean {
  const referenceDate = options?.referenceDate ?? new Date();
  const now = referenceDate.getTime();

  const trial = summary.trial;
  if (trial?.isActive === true) {
    return true;
  }

  const bill = normalizedStatus(summary.billingStatus);
  if (bill && BILLING_STATUS_TRIAL.has(bill)) {
    return true;
  }

  const access = normalizedStatus(summary.accessStatus);
  if (access && ACCESS_STATUS_TRIAL.has(access)) {
    return true;
  }

  if (trial?.isActive === false) {
    return false;
  }

  const end = parseInstant(trial?.endDate ?? null);
  if (end !== null && end > now) {
    return true;
  }

  return false;
}

function isAccessDenied(summary: AccountBillingSummaryV1, referenceDate: Date): boolean {
  const access = normalizedStatus(summary.accessStatus);
  if (access && (ACCESS_DENIED_CODES.has(access) || access.includes("denied"))) {
    return true;
  }

  const bill = normalizedStatus(summary.billingStatus);
  if (bill && BILLING_UNPAID_STRESS.has(bill)) {
    return !isActiveTrial(summary, { referenceDate });
  }

  return false;
}

function isEmptyBillingPortfolio(
  summary: AccountBillingSummaryV1,
  referenceDate: Date,
  options?: DeriveBillingUiModeOptions,
): boolean {
  if (normalizedStatus(summary.billingStatus) === BILLING_STATUS_TRIAL_AVAILABLE) {
    return false;
  }
  if (summary.currentPlan != null) {
    return false;
  }
  if (summary.activeOrder != null) {
    return false;
  }
  if (isActiveTrial(summary, { referenceDate })) {
    return false;
  }
  if (hasPaymentPending(summary, options)) {
    return false;
  }
  return true;
}

export function qualifiesFreeTrialAvailable(
  summary: AccountBillingSummaryV1,
  referenceDate: Date,
  options?: DeriveBillingUiModeOptions,
): boolean {
  if (hasPaymentPending(summary, options)) {
    return false;
  }
  if (
    hasPaidActiveOrder(summary) ||
    hasPaidPlanWithoutPendingOrder(summary, { referenceDate }) ||
    hasPaidActiveOrderFromOrderHistory(options?.orders)
  ) {
    return false;
  }
  if (isActiveTrial(summary, { referenceDate })) {
    return false;
  }
  const bill = normalizedStatus(summary.billingStatus);
  if (bill !== BILLING_STATUS_TRIAL_AVAILABLE) {
    return false;
  }
  return canStartTrial(summary.availableActions);
}

/**
 * Resolve a single UI mode; first matching rule wins (see block comment below).
 *
 * Precedence:
 * 1. `paid_active` — active paid entitlement: summary `activeOrder`, paid plan signals, or **paid+active row** on GET /orders
 * 2. `payment_pending` — invoice request in-flight, order/checkout not complete, or invoice issued awaiting payment
 * 3. `free_trial_available` — CMS `trial_available`, not yet running trial; requires `canStartTrial` / `can_start_trial`
 * 4. `active_trial` — trial flag, billing/access trial codes, or future `trial.endDate` when not explicitly inactive
 * 5. `trial_expired` — trial row present, inactive, not pre-start `trial_available`, no paid order
 * 6. `access_denied` — denied/locked/no access codes, or unpaid/past_due without active trial
 * 7. `no_billing` — empty portfolio (no plan, no order, no active trial, no pending payment signals)
 * 8. `unknown` — fallback (e.g. `trial_available` without start flag)
 */
export function deriveBillingUiMode(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): BillingUiMode {
  const referenceDate = options?.referenceDate ?? new Date();

  if (
    hasPaidActiveOrder(summary) ||
    hasPaidPlanWithoutPendingOrder(summary, { referenceDate }) ||
    hasPaidActiveOrderFromOrderHistory(options?.orders)
  ) {
    return "paid_active";
  }

  if (hasPaymentPending(summary, options)) {
    return "payment_pending";
  }

  if (qualifiesFreeTrialAvailable(summary, referenceDate, options)) {
    return "free_trial_available";
  }

  if (isActiveTrial(summary, { referenceDate })) {
    return "active_trial";
  }

  const bill = normalizedStatus(summary.billingStatus);
  if (
    summary.trial != null &&
    !hasPaidActiveOrder(summary) &&
    !hasPaidActiveOrderFromOrderHistory(options?.orders) &&
    bill !== BILLING_STATUS_TRIAL_AVAILABLE
  ) {
    return "trial_expired";
  }

  if (isAccessDenied(summary, referenceDate)) {
    return "access_denied";
  }

  if (isEmptyBillingPortfolio(summary, referenceDate, options)) {
    return "no_billing";
  }

  return "unknown";
}

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
    /** Any GET /orders row has normalized checkout `invoice_issued`. */
    ordersHaveInvoiceIssuedCheckout: boolean;
  };
  helpers: {
    canStartTrial: boolean;
    trialDaysRemaining: number | null;
  };
};

export function getBillingDebugSnapshot(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): BillingDebugSnapshot {
  const referenceDate = options?.referenceDate ?? new Date();
  const bill = normalizedStatus(summary.billingStatus);
  const billingUiMode = deriveBillingUiMode(summary, options);
  const trialExpiredBranchInputs =
    summary.trial != null &&
    !hasPaidActiveOrder(summary) &&
    !hasPaidActiveOrderFromOrderHistory(options?.orders) &&
    bill !== BILLING_STATUS_TRIAL_AVAILABLE;

  return {
    referenceIso: referenceDate.toISOString(),
    billingUiMode,
    billingProductState: deriveBillingProductState(billingUiMode),
    derivationFlags: {
      uiModeIsPaymentPending: billingUiMode === "payment_pending",
      payloadHasPaymentPendingSignals: hasPaymentPending(summary, options),
      paidActiveDespitePendingSignalsInPayload:
        billingUiMode === "paid_active" && hasPaymentPending(summary, options),
      paidEntitlementFromSummaryActiveOrder: hasPaidActiveOrder(summary),
      paidEntitlementFromOrderHistory: hasPaidActiveOrderFromOrderHistory(options?.orders),
      paidEntitlementFromPlanOrBillingState: hasPaidPlanWithoutPendingOrder(summary, options),
      qualifiesForFreeTrialStart: qualifiesFreeTrialAvailable(summary, referenceDate, options),
      trialIsActiveForUi: isActiveTrial(summary, options),
      trialExpiredBranchPreconditionsMet: trialExpiredBranchInputs,
      accessDeniedOrUnpaidStress: isAccessDenied(summary, referenceDate),
      billingPortfolioIsEmpty: isEmptyBillingPortfolio(summary, referenceDate, options),
    },
    summarySlice: {
      billingStatus: summary.billingStatus,
      accessStatus: summary.accessStatus,
      currentPlanId: summary.currentPlan?.id ?? null,
      trialRowPresent: summary.trial != null,
      trialIsActive: summary.trial?.isActive,
      trialEndDate: summary.trial?.endDate,
      activeOrderPresent: summary.activeOrder != null,
      orderStripeStatus: summary.activeOrder?.stripe_status ?? null,
      orderPaymentStatus: summary.activeOrder?.payment_status ?? null,
      orderCheckoutStatus: summary.activeOrder?.checkout_status ?? null,
      orderIsActive: summary.activeOrder?.isActive,
      orderCancelAtPeriodEnd: summary.activeOrder?.cancel_at_period_end,
      latestInvoiceRequestStatus: summary.latestInvoiceRequest?.status,
      availableActionsTrueFromApi: Object.entries(summary.availableActions ?? {})
        .filter(([, v]) => v === true)
        .map(([k]) => k),
      availableActionsTrueShownInOverview: trueAvailableActionKeysAfterBillingUiMode(
        summary.availableActions,
        billingUiMode,
      ),
      ordersHaveInvoiceIssuedCheckout: Boolean(
        options?.orders?.some(
          (row) => normalizedStatus(row.checkoutStatus ?? "") === "invoice_issued",
        ),
      ),
    },
    helpers: {
      canStartTrial: canStartTrial(summary.availableActions),
      trialDaysRemaining: trialDaysRemaining(summary.trial?.endDate ?? null, options),
    },
  };
}

/**
 * Whole days remaining from reference date until `endDate` (exclusive of partial last day).
 * Returns `null` if end is missing or invalid.
 */
export function trialDaysRemaining(
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const referenceDate = options?.referenceDate ?? new Date();
  const endMs = parseInstant(endDateIso ?? null);
  if (endMs === null) {
    return null;
  }
  const diffMs = endMs - referenceDate.getTime();
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / 86400000);
}

/**
 * Trial progress 0–100 aligned with {@link trialDaysRemaining} (whole-day model): elapsed days /
 * total whole days between start and end. Returns `null` if bounds are missing or invalid.
 */
export function trialElapsedProgressPercent(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null) {
    return null;
  }
  const totalMs = endMs - startMs;
  if (totalMs <= 0) {
    return null;
  }
  const totalDays = Math.max(1, Math.ceil(totalMs / 86400000));
  const remaining = trialDaysRemaining(endDateIso, options);
  if (remaining === null) {
    return null;
  }
  const elapsedDays = Math.min(totalDays, Math.max(0, totalDays - remaining));
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}

/**
 * Whole days left **inside** `[startDateIso, endDateIso]` — counts only up to renewal from the
 * later of reference date or period start (so we never report more days than the subscribed
 * window, e.g. when today is before `startOrderAt`).
 */
export function billingPeriodDaysRemaining(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null || endMs <= startMs) {
    return null;
  }
  const refMs = (options?.referenceDate ?? new Date()).getTime();
  const effectiveRefMs = Math.max(refMs, startMs);
  const diffMs = endMs - effectiveRefMs;
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / 86400000);
}

/** Continuous 0–100% elapsed through the billing window (`start`→`end`), clamped by reference date. */
export function billingPeriodElapsedProgressPercent(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null || endMs <= startMs) {
    return null;
  }
  const refMs = (options?.referenceDate ?? new Date()).getTime();
  if (refMs <= startMs) {
    return 0;
  }
  if (refMs >= endMs) {
    return 100;
  }
  const elapsed = refMs - startMs;
  const total = endMs - startMs;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
