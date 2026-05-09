import { trialDaysRemaining } from "./billing-date-progress";
import { deriveBillingProductState, deriveBillingUiMode } from "./billing-state-derivation";
import {
  canStartTrial,
  hasPaidActiveOrder,
  hasPaidActiveOrderFromOrderHistory,
  hasPaidPlanWithoutPendingOrder,
  hasPaymentPending,
  hasTrialExpiredBranchPreconditions,
  isAccessDenied,
  isActiveTrial,
  isEmptyBillingPortfolio,
  normalizedStatus,
  qualifiesFreeTrialAvailable,
} from "./billing-state-helpers";
import { trueAvailableActionKeysAfterBillingUiMode } from "../../_utils/overview/availableActionsUiGate";

import type { BillingDebugSnapshot, DeriveBillingUiModeOptions } from "../_types/billing-state";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

export function getBillingDebugSnapshot(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): BillingDebugSnapshot {
  const referenceDate = options?.referenceDate ?? new Date();
  const billingUiMode = deriveBillingUiMode(summary, options);

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
      trialExpiredBranchPreconditionsMet: hasTrialExpiredBranchPreconditions(summary, options),
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
        .filter(([, value]) => value === true)
        .map(([key]) => key),
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
