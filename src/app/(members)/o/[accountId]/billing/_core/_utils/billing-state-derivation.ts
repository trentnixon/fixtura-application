import {
  hasPaidActiveOrder,
  hasPaidActiveOrderFromOrderHistory,
  hasPaidPlanWithoutPendingOrder,
  hasPaymentPending,
  hasTrialExpiredBranchPreconditions,
  isAccessDenied,
  isActiveTrial,
  isEmptyBillingPortfolio,
  qualifiesFreeTrialAvailable,
} from "./billing-state-helpers";

import type {
  BillingProductState,
  BillingUiMode,
  DeriveBillingUiModeOptions,
} from "../_types/billing-state";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

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

/**
 * Resolve a single UI mode; first matching rule wins.
 *
 * Precedence:
 * 1. `paid_active` - active paid entitlement: summary `activeOrder`, paid plan signals, or paid+active row on GET /orders
 * 2. `payment_pending` - order/checkout not complete, or invoice issued awaiting payment
 * 3. `free_trial_available` - CMS `trial_available`, not yet running trial; requires `canStartTrial` / `can_start_trial`
 * 4. `active_trial` - trial flag, billing/access trial codes, or future `trial.endDate` when not explicitly inactive
 * 5. `trial_expired` - trial row present, inactive, not pre-start `trial_available`, no paid order
 * 6. `access_denied` - denied/locked/no access codes, or unpaid/past_due without active trial
 * 7. `no_billing` - empty portfolio (no plan, no order, no active trial, no pending payment signals)
 * 8. `unknown` - fallback (e.g. `trial_available` without start flag)
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

  if (hasTrialExpiredBranchPreconditions(summary, options)) {
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
