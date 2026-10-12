import { deriveBillingUiMode } from "@/app/(members)/o/[accountId]/billing/_core/billing-state";
import {
  isOrderEndingSoon,
  toSeasonPassOrderDisplayFromSummary,
} from "@/app/(members)/o/[accountId]/billing/_utils/orders/orderSeasonPassDisplayState";

import type { AccountBillingSummaryV1 } from "@/types/api/account";

export const SELECT_ORG_SUBSCRIPTION_LABELS = {
  active: "Subscription Active",
  "ending-soon": "Subscription Ending Soon",
  none: "No Active Subscription",
} as const;

export type SelectOrgSubscriptionStatus = keyof typeof SELECT_ORG_SUBSCRIPTION_LABELS;

export type SelectOrgSubscriptionBadgeState = SelectOrgSubscriptionStatus | "loading";

const SELECT_ORG_SUBSCRIPTION_DESCRIPTIONS: Record<SelectOrgSubscriptionStatus, string> = {
  active: "This organisation has a current subscription or trial.",
  "ending-soon":
    "This subscription ends within 7 days, or will cancel at the end of the current period.",
  none: "This organisation does not have a current subscription.",
};

export function selectOrgSubscriptionLabel(status: SelectOrgSubscriptionStatus): string {
  return SELECT_ORG_SUBSCRIPTION_LABELS[status];
}

export function selectOrgSubscriptionDescription(status: SelectOrgSubscriptionStatus): string {
  return SELECT_ORG_SUBSCRIPTION_DESCRIPTIONS[status];
}

/**
 * Three-way subscription badge for the organisation picker.
 * Current paid access or an active trial is Active.
 * Ending Soon matches the billing overview: a paid active order within 7 Sydney days of its end,
 * or cancel-at-period-end on a current entitlement.
 */
export function deriveSelectOrgSubscriptionStatus(
  summary: AccountBillingSummaryV1,
  options?: { referenceDate?: Date },
): SelectOrgSubscriptionStatus {
  const referenceDate = options?.referenceDate;
  const mode = deriveBillingUiMode(summary, referenceDate ? { referenceDate } : undefined);

  if (mode !== "paid_active" && mode !== "active_trial") {
    return "none";
  }

  const order = summary.activeOrder;
  if (order?.cancel_at_period_end === true) {
    return "ending-soon";
  }

  if (
    order &&
    isOrderEndingSoon(
      toSeasonPassOrderDisplayFromSummary(order),
      referenceDate ? { referenceDate } : undefined,
    )
  ) {
    return "ending-soon";
  }

  return "active";
}

export function selectOrgSubscriptionBadgeState(input: {
  simulating: boolean;
  isPending: boolean;
  isError: boolean;
  summary: AccountBillingSummaryV1 | undefined;
}): SelectOrgSubscriptionBadgeState | undefined {
  if (input.simulating) return undefined;
  if (input.isPending) return "loading";
  if (input.isError || input.summary == null) return undefined;
  return deriveSelectOrgSubscriptionStatus(input.summary);
}
