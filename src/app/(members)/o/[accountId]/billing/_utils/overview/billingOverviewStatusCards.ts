import {
  billingPeriodDaysRemaining,
  billingPeriodElapsedProgressPercent,
  trialDaysRemaining,
  trialElapsedProgressPercent,
} from "../../_core/billing-state";
import { resolvePaidSubscriptionPeriodBounds } from "../orders/billingHistoryOrderUtils";
import {
  billingTrialTierDisplayLabel,
  hasMeaningfulActiveOrder,
  paidSubscriptionTierDisplayLabel,
} from "../trial/billingTrialDetails";

import type {
  ActiveTrialStatusCardViewModel,
  BillingSectionsViewModel,
  PaidActiveStatusCardViewModel,
} from "../../_types/overview/billingOverviewStatusCards";
import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  AvailableBillingTier,
  BillingTrialSummaryV1,
} from "@/types/api/account";

export function buildActiveTrialStatusCardViewModel(
  trial: BillingTrialSummaryV1 | null,
): ActiveTrialStatusCardViewModel {
  const elapsedPercent =
    trial != null ? trialElapsedProgressPercent(trial.startDate, trial.endDate) : null;

  return {
    daysRemaining: trialDaysRemaining(trial?.endDate ?? null),
    remainingPercent: elapsedPercent != null ? 100 - elapsedPercent : null,
    tierLabel: billingTrialTierDisplayLabel(trial),
  };
}

export function buildBillingSectionsViewModel(
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[],
  ordersLoadError: Error | null,
): BillingSectionsViewModel<AccountBillingOrderDto> {
  return {
    meaningfulActiveOrder: hasMeaningfulActiveOrder(activeOrder) ? activeOrder : null,
    showOrdersSection: orders.length > 0 || ordersLoadError != null,
  };
}

export function buildPaidActiveStatusCardViewModel(
  activeOrder: AccountBillingOrderDto | null,
  currentPlan: AvailableBillingTier | null,
  orders: AccountBillingOrderHistoryDto[],
): PaidActiveStatusCardViewModel {
  const { startIso: startAt, endIso: endAt } = resolvePaidSubscriptionPeriodBounds(
    activeOrder,
    orders,
  );
  const hasPeriodBounds = Boolean(startAt && endAt);
  const elapsedPercent =
    hasPeriodBounds && startAt && endAt
      ? billingPeriodElapsedProgressPercent(startAt, endAt)
      : null;

  return {
    daysRemaining:
      hasPeriodBounds && startAt && endAt ? billingPeriodDaysRemaining(startAt, endAt) : null,
    endAt,
    hasPeriodBounds,
    remainingPercent: elapsedPercent != null ? 100 - elapsedPercent : null,
    startAt,
    tierLabel: paidSubscriptionTierDisplayLabel(activeOrder, currentPlan),
  };
}
