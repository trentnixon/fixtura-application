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
  qualifiesFreeTrialAvailable,
} from "./billing-state-helpers";
import {
  getInvoiceOrderPresentation,
  isInvoiceAwaitingPayment,
  toInvoiceOrderStateFromHistory,
  toInvoiceOrderStateFromSummary,
} from "../../_utils/orders/invoiceOrderState";
import { trueAvailableActionKeysAfterBillingUiMode } from "../../_utils/overview/availableActionsUiGate";
import { deriveOrganisationTrialPresentation } from "../../_utils/trial/deriveOrganisationTrialPresentation";

import type { BillingDebugSnapshot, DeriveBillingUiModeOptions } from "../_types/billing-state";
import type { AccountBillingSummaryV1 } from "@/types/api/account";

export function getBillingDebugSnapshot(
  summary: AccountBillingSummaryV1,
  options?: DeriveBillingUiModeOptions,
): BillingDebugSnapshot {
  const referenceDate = options?.referenceDate ?? new Date();
  const billingUiMode = deriveBillingUiMode(summary, options);
  const orgTrial = deriveOrganisationTrialPresentation(summary);
  const actionsCanStartTrial = canStartTrial(summary.availableActions);
  const orgBlock = summary.organisationTrial;
  const activeInvoiceState = summary.activeOrder
    ? toInvoiceOrderStateFromSummary(summary.activeOrder)
    : null;
  const activeInvoicePresentation = activeInvoiceState
    ? getInvoiceOrderPresentation(activeInvoiceState)
    : null;
  const ordersAwaitingPayment = Boolean(
    options?.orders?.some((row) => isInvoiceAwaitingPayment(toInvoiceOrderStateFromHistory(row))),
  );
  const ordersHaveInconsistentInvoiceState = Boolean(
    options?.orders?.some(
      (row) => getInvoiceOrderPresentation(toInvoiceOrderStateFromHistory(row)).inconsistent,
    ) || activeInvoicePresentation?.inconsistent,
  );

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
      ordersHaveInvoiceIssuedCheckout:
        ordersAwaitingPayment || Boolean(activeInvoicePresentation?.awaitingPayment),
      invoiceOrderInconsistent: ordersHaveInconsistentInvoiceState,
      invoiceOrderAwaitingPayment:
        ordersAwaitingPayment || Boolean(activeInvoicePresentation?.awaitingPayment),
      invoiceOrderPaidActive: Boolean(activeInvoicePresentation?.paidActive),
      invoiceOrderCancelled: Boolean(activeInvoicePresentation?.cancelled),
    },
    helpers: {
      canStartTrial: actionsCanStartTrial,
      trialDaysRemaining: trialDaysRemaining(summary.trial?.endDate ?? null, options),
    },
    organisationTrial: {
      presentation: orgTrial.presentation,
      failClosed: orgTrial.failClosed,
      reason: orgTrial.reason ?? null,
      consumptionStatus: orgBlock?.consumptionStatus ?? null,
      allocationStatus: orgBlock?.allocationStatus ?? null,
      orgCanStartTrial: orgBlock?.canStartTrial ?? null,
      actionsCanStartTrial,
      actionFlagsConsistent:
        orgBlock != null ? orgBlock.canStartTrial === actionsCanStartTrial : false,
    },
  };
}
