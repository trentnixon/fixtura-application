import { normalizeBillingCode } from "../../_utils/overview/billingSummaryLabels";
import {
  ACCESS_DENIED_CODES,
  ACCESS_PAID_SIGNALS,
  ACCESS_STATUS_TRIAL,
  BILLING_PAID_SIGNALS,
  BILLING_STATUS_TRIAL,
  BILLING_STATUS_TRIAL_AVAILABLE,
  BILLING_UNPAID_STRESS,
  ORDER_PAYMENT_PENDING,
  ORDER_PENDING_CHECKOUT_STATUSES,
  ORDER_STRIPE_PENDING,
} from "../_constants/billing-state";

import type { DeriveBillingUiModeOptions } from "../_types/billing-state";
import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

export function canStartTrial(actions?: Partial<Record<string, boolean>>): boolean {
  if (actions == null) {
    return false;
  }
  if (Object.keys(actions).length === 0) {
    return false;
  }
  return actions["canStartTrial"] === true || actions["can_start_trial"] === true;
}

export function normalizedStatus(value: string | null | undefined): string {
  if (value == null || value === "") {
    return "";
  }
  return normalizeBillingCode(value);
}

export function parseInstant(value: string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function statusIndicatesPendingCheckout(checkout: string): boolean {
  return ORDER_PENDING_CHECKOUT_STATUSES.has(checkout) || checkout.includes("pending");
}

export function orderHistoryRowIndicatesPaymentPending(
  row: AccountBillingOrderHistoryDto,
): boolean {
  const stripe = normalizedStatus(row.stripeStatus ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) {
    return true;
  }

  const pay = normalizedStatus(row.paymentStatus ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
    return true;
  }

  const checkout = normalizedStatus(row.checkoutStatus ?? "");
  return Boolean(checkout && statusIndicatesPendingCheckout(checkout));
}

export function hasPaymentPendingFromOrderHistory(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): boolean {
  if (!orders?.length) {
    return false;
  }
  return orders.some(orderHistoryRowIndicatesPaymentPending);
}

/**
 * True when `activeOrder` has Stripe/payment/checkout fields that imply checkout or payment still in flight.
 * Does not inspect `latestInvoiceRequest` - stale `submitted` without any order/checkout signal is ignored in `hasPaymentPending`.
 */
export function activeOrderIndicatesPaymentPending(
  order: NonNullable<AccountBillingSummaryV1["activeOrder"]>,
): boolean {
  const stripe = normalizedStatus(order.stripe_status ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) {
    return true;
  }

  const pay = normalizedStatus(order.payment_status ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
    return true;
  }

  const checkout = normalizedStatus(order.checkout_status ?? "");
  return Boolean(checkout && statusIndicatesPendingCheckout(checkout));
}

export function hasPaymentPending(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): boolean {
  const activeOrder = summary.activeOrder;
  if (activeOrder && activeOrderIndicatesPaymentPending(activeOrder)) {
    return true;
  }

  if (hasPaymentPendingFromOrderHistory(options?.orders)) {
    return true;
  }

  return false;
}

/**
 * Trial is "active" for UI purposes: CMS flag, known status codes, or future end date when not explicitly inactive.
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
  return end !== null && end > now;
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

  if (BILLING_PAID_SIGNALS.has(bill)) {
    return true;
  }

  const access = normalizedStatus(summary.accessStatus);
  return ACCESS_PAID_SIGNALS.has(access);
}

/**
 * Paid entitlement on file - conservative so incomplete checkout rows favour `payment_pending` instead.
 */
export function hasPaidActiveOrder(summary: AccountBillingSummaryV1): boolean {
  const activeOrder = summary.activeOrder;
  if (!activeOrder) {
    return false;
  }

  if (activeOrder.isActive === true) {
    const stripe = normalizedStatus(activeOrder.stripe_status ?? "");
    if (stripe && (ORDER_STRIPE_PENDING.has(stripe) || ORDER_PAYMENT_PENDING.has(stripe))) {
      return false;
    }

    const pay = normalizedStatus(activeOrder.payment_status ?? "");
    if (pay && (ORDER_PAYMENT_PENDING.has(pay) || pay === "incomplete")) {
      return false;
    }

    return true;
  }

  if (activeOrder.OrderPaid === true) {
    return true;
  }

  const stripe = normalizedStatus(activeOrder.stripe_status ?? "");
  return stripe === "active" || stripe === "trialing";
}

/**
 * True when GET /orders includes at least one row that CMS marks as paid and active (strict booleans).
 * Used when billing summary omits `activeOrder` but order history is current - can override stale
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

export function hasTrialExpiredBranchPreconditions(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): boolean {
  const bill = normalizedStatus(summary.billingStatus);
  return (
    summary.trial != null &&
    !hasPaidActiveOrder(summary) &&
    !hasPaidActiveOrderFromOrderHistory(options?.orders) &&
    bill !== BILLING_STATUS_TRIAL_AVAILABLE
  );
}

export function isAccessDenied(summary: AccountBillingSummaryV1, referenceDate: Date): boolean {
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

export function isEmptyBillingPortfolio(
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
