import { BILLING_PAID_ACTIVE_STATUS_COPY } from "../_constants/billingPaidActiveStatus";
import { BILLING_TRIAL_DETAILS_COPY } from "../_constants/billingTrialDetails";
import {
  hasPaidActiveOrderFromOrderHistory,
  isActiveTrial,
  qualifiesFreeTrialAvailable,
  trialDaysRemaining,
  type BillingUiMode,
} from "../core/billing-state";

import type { BillingTrialDetailsTriggerOptions } from "../_types/billingTrialDetails";
import type {
  AccountBillingOrderDto,
  AccountBillingSummaryV1,
  AvailableBillingTier,
  BillingTrialSummaryV1,
} from "@/types/api/account";

export function hasMeaningfulActiveOrder(
  order: AccountBillingOrderDto | null | undefined,
): boolean {
  if (!order) return false;
  return Boolean(
    order.Name?.trim() ||
    order.startOrderAt ||
    order.total != null ||
    order.stripe_status?.trim() ||
    order.payment_status?.trim() ||
    order.hosted_invoice_url?.trim(),
  );
}

/**
 * When to show the “past trial” dialog trigger. Hidden while a trial can be started or is active,
 * including cases where `deriveBillingUiMode` picks `paid_active` before trial branches.
 */
export function billingTrialDetailsTriggerState(
  summary: AccountBillingSummaryV1,
  uiMode: BillingUiMode,
  options?: BillingTrialDetailsTriggerOptions,
): { emphasize: boolean } | null {
  const referenceDate = options?.referenceDate ?? new Date();

  if (isActiveTrial(summary, { referenceDate })) {
    return null;
  }
  if (qualifiesFreeTrialAvailable(summary, referenceDate, { orders: options?.orders ?? null })) {
    return null;
  }

  const activeOrder = summary.activeOrder;
  const meaningfulActiveOrder = hasMeaningfulActiveOrder(activeOrder) ? activeOrder : null;
  const paidEntitlementFromOrders = hasPaidActiveOrderFromOrderHistory(options?.orders);
  const showTrialBelowPaidOrder =
    uiMode === "paid_active" && (Boolean(activeOrder) || paidEntitlementFromOrders);
  if (showTrialBelowPaidOrder) {
    return meaningfulActiveOrder ? { emphasize: false } : null;
  }
  if (uiMode === "free_trial_available" || uiMode === "active_trial") {
    return null;
  }
  return { emphasize: true };
}

/** Label for the trial dialog trigger (completed/used vs neutral where that wording would mislead). */
export function billingTrialDetailsButtonLabel(uiMode: BillingUiMode): string {
  if (uiMode === "paid_active" || uiMode === "trial_expired") {
    return BILLING_TRIAL_DETAILS_COPY.buttonCompleted;
  }
  return BILLING_TRIAL_DETAILS_COPY.buttonDefault;
}

export function formatTrialDaysRemainingLine(daysRemaining: number): string {
  if (daysRemaining === 0) {
    return BILLING_TRIAL_DETAILS_COPY.lastDayOfTrial;
  }
  return `About ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining.`;
}

export function billingTrialEligibleCaption(eligible: boolean | undefined): string | null {
  if (eligible === undefined) return null;
  return (
    BILLING_TRIAL_DETAILS_COPY.eligiblePrefix +
    (eligible ? BILLING_TRIAL_DETAILS_COPY.eligibleYes : BILLING_TRIAL_DETAILS_COPY.eligibleNo)
  );
}

export function billingTrialTierDisplayLabel(
  trial: BillingTrialSummaryV1 | null | undefined,
): string | null {
  return trial?.subscriptionTier?.name ?? null;
}

/** Tier title for paid overview when GET /billing embeds `activeOrder.subscriptionTier`. */
export function paidSubscriptionTierDisplayLabel(
  activeOrder: AccountBillingOrderDto | null | undefined,
  currentPlan: AvailableBillingTier | null | undefined,
): string | null {
  const tier = activeOrder?.subscriptionTier;
  const fromOrder = tier?.Title?.trim() || tier?.Name?.trim();
  if (fromOrder) {
    return fromOrder;
  }
  return currentPlan?.name?.trim() ?? null;
}

export function formatPaidPeriodDaysRemainingLine(daysRemaining: number): string {
  if (daysRemaining === 0) {
    return "Last day of this billing period.";
  }
  return `About ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining in this billing period.`;
}

export function billingTrialDetailsBodyDescription(
  emphasize: boolean,
  uiMode: BillingUiMode,
): string {
  if (!emphasize) {
    return BILLING_TRIAL_DETAILS_COPY.descriptionNonEmphasize;
  }
  if (uiMode === "free_trial_available") {
    return BILLING_TRIAL_DETAILS_COPY.descriptionFreeTrialAvailable;
  }
  return BILLING_TRIAL_DETAILS_COPY.descriptionDefault;
}

export function billingTrialDetailsDaysRemainingForDisplay(
  uiMode: BillingUiMode,
  trial: BillingTrialSummaryV1 | null | undefined,
): number | null {
  if (uiMode !== "active_trial") {
    return null;
  }
  return trialDaysRemaining(trial?.endDate ?? null);
}

export function billingTrialDetailsBadgeVariant(uiMode: BillingUiMode): "outline" | "secondary" {
  return uiMode === "active_trial" || uiMode === "paid_active" ? "secondary" : "outline";
}

export function billingTrialDetailsBadgeLabel(uiMode: BillingUiMode): string {
  if (uiMode === "active_trial") {
    return BILLING_TRIAL_DETAILS_COPY.badgeActive;
  }
  if (uiMode === "paid_active") {
    return BILLING_PAID_ACTIVE_STATUS_COPY.badgeActive;
  }
  if (uiMode === "free_trial_available") {
    return BILLING_TRIAL_DETAILS_COPY.badgeNotStarted;
  }
  return BILLING_TRIAL_DETAILS_COPY.badgeInactive;
}
