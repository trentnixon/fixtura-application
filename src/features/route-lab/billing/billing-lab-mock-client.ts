import { billingLabSummaryForScenario, labBillingTiersForCategory } from "./billing-lab-fixtures";
import {
  BILLING_LAB_TRIAL_DAYS,
  type BillingLabMode,
  type LabBillingSummary,
  type LabBillingTier,
  type LabCheckoutPayload,
  type LabInvoiceRequestPayload,
  type LabReturnSimulationState,
  type MockCheckoutResponse,
  type MockInvoiceRequestResponse,
} from "./lab-billing-types";

export function normalizeBillingLabMode(raw: string): BillingLabMode {
  return raw === "active" ? "active" : "wizard";
}

/** When `state=default`, pick a sensible fixture per lab mode. */
export function resolveBillingLabFixtureScenario(
  rawState: string,
  labMode: BillingLabMode,
): string {
  if (rawState !== "default") return rawState;
  return labMode === "active" ? "active_season" : "not_started";
}

export function getLabBillingSummary(accountId: string, scenarioKey: string): LabBillingSummary {
  return billingLabSummaryForScenario(accountId, scenarioKey);
}

export function getLabAvailableBillingTiers(
  _accountId: string,
  category: LabBillingTier["category"],
): LabBillingTier[] {
  return labBillingTiersForCategory(category);
}

function addDaysToIsoLab(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Simulated “Start trial” — 14-day lab trial from today (no CMS). */
export function startLabTrial(summary: LabBillingSummary): LabBillingSummary {
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = addDaysToIsoLab(startDate, BILLING_LAB_TRIAL_DAYS);
  return {
    ...summary,
    accessStatus: "active",
    billingStatus: "trialing",
    trial: {
      isEligible: false,
      isActive: true,
      startDate,
      endDate,
      daysRemaining: BILLING_LAB_TRIAL_DAYS,
    },
    availableActions: {
      canStartTrial: false,
      canSelectPlan: false,
      canStartCheckout: false,
      canRequestInvoice: false,
      canViewInvoice: false,
      canDownloadInvoice: false,
      canContactSupport: true,
    },
  };
}

export function createLabCheckout(
  accountId: string,
  payload: LabCheckoutPayload,
): MockCheckoutResponse {
  return {
    checkoutSessionId: `cs_lab_${accountId}_${payload.tierId}_${Date.now()}`,
    checkoutUrl: null,
    orderId: `ord_lab_${payload.tierId}_${Date.now()}`,
    labOnly: true,
  };
}

export function createLabInvoiceRequest(
  accountId: string,
  payload: LabInvoiceRequestPayload,
): MockInvoiceRequestResponse {
  return {
    invoiceRequestId: `invreq_lab_${accountId}_${Date.now()}`,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    message: `Lab invoice request recorded for ${payload.tierName} (${payload.organisationLegalName}). No CMS write.`,
    labOnly: true,
  };
}

/**
 * For success/cancelled return pages — produce a post-return summary without calling APIs.
 */
export function applyLabReturnState(
  accountId: string,
  scenarioKey: string,
  returnState: LabReturnSimulationState,
): LabBillingSummary {
  const base = billingLabSummaryForScenario(accountId, scenarioKey);

  if (returnState === "cancelled") {
    return {
      ...base,
      billingStatus: "cancelled",
      accessStatus: "restricted",
      activeOrder: base.activeOrder
        ? {
            ...base.activeOrder,
            status: "cancelled",
            paymentStatus: "cancelled",
          }
        : null,
    };
  }

  if (returnState === "payment_processing") {
    return {
      ...base,
      billingStatus: "payment_pending",
      accessStatus: "pending",
      activeOrder: base.activeOrder
        ? {
            ...base.activeOrder,
            paymentStatus: "processing",
            status: "processing",
          }
        : orderPlaceholder(),
    };
  }

  if (returnState === "payment_not_found") {
    return {
      ...base,
      billingStatus: "payment_failed",
      accessStatus: "restricted",
      activeOrder: null,
    };
  }

  /* payment_ok */
  return {
    ...base,
    billingStatus: "active",
    accessStatus: "active",
    activeOrder: base.activeOrder
      ? {
          ...base.activeOrder,
          paymentStatus: "paid",
          status: "paid",
          startDate: base.activeOrder.startDate ?? "2026-04-01",
          endDate: base.activeOrder.endDate ?? "2026-09-28",
          daysRemaining: base.activeOrder.daysRemaining ?? 120,
        }
      : orderPlaceholder(),
  };
}

function orderPlaceholder(): NonNullable<LabBillingSummary["activeOrder"]> {
  return {
    id: `ord_lab_after_return_${Date.now()}`,
    status: "paid",
    paymentStatus: "paid",
    startDate: "2026-04-01",
    endDate: "2026-09-28",
    daysRemaining: 120,
    hostedInvoiceUrl: null,
    invoicePdf: null,
    labOnly: true,
  };
}

export type BillingLabPathResolution = {
  selectedTierId: string | null;
  requestedStartDate: string | null;
  paymentMethod: "none" | "card" | "invoice";
  checkoutStarted: boolean;
  stripeReturnSimulated: boolean;
  invoiceSubmitted: boolean;
  refreshed: boolean;
};

/** Index into BILLING_LAB_PATH_TRACKER_STEPS (0-based, max 7). */
export function resolveBillingLabPathHighlight(resolution: BillingLabPathResolution): number {
  let step = 0;
  if (resolution.selectedTierId) step = 1;
  if (resolution.requestedStartDate) step = 2;
  if (resolution.paymentMethod !== "none") step = 3;
  if (resolution.checkoutStarted) step = 4;
  if (resolution.stripeReturnSimulated) step = 5;
  if (resolution.invoiceSubmitted) step = 6;
  if (resolution.refreshed) step = 7;
  return step;
}
