import type { LabBillingSummary } from "./lab-billing-types";
import type { AccountBillingSummaryV1, AccountBillingOrderDto } from "@/types/api/account";

function labActiveOrderToDto(
  order: NonNullable<LabBillingSummary["activeOrder"]>,
): AccountBillingOrderDto {
  const paid = order.paymentStatus === "paid";
  return {
    id: 1,
    Name: null,
    total: null,
    currency: null,
    OrderPaid: paid,
    payment_status: order.paymentStatus,
    checkout_status: order.status,
    payment_channel: null,
    startOrderAt: order.startDate,
    endOrderAt: order.endDate,
    isActive: paid,
    isPaused: false,
    cancel_at_period_end: null,
    stripe_subscription_id: null,
    stripe_status: order.status,
    hosted_invoice_url: order.hostedInvoiceUrl,
    invoice_pdf: order.invoicePdf,
    invoice_number: null,
    invoice_due_date: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    subscriptionTier: null,
  };
}

/**
 * Maps Route Lab billing fixtures to the production GET billing summary shape
 * for `deriveBillingUiMode` and `deriveOrganisationTrialPresentation`.
 */
export function labSummaryToAccountBillingSummary(lab: LabBillingSummary): AccountBillingSummaryV1 {
  return {
    billingStatus: lab.billingStatus,
    accessStatus: lab.accessStatus,
    currentPlan: lab.currentPlan
      ? ({
          ...lab.currentPlan,
          orderId: null,
          paymentChannel: null,
        } as AccountBillingSummaryV1["currentPlan"])
      : null,
    trial: {
      isEligible: lab.trial.isEligible,
      isActive: lab.trial.isActive,
      startDate: lab.trial.startDate,
      endDate: lab.trial.endDate,
      daysRemaining: lab.trial.daysRemaining,
    },
    organisationTrial: lab.organisationTrial,
    activeOrder: lab.activeOrder ? labActiveOrderToDto(lab.activeOrder) : null,
    latestInvoiceRequest: null,
    availableActions: {
      canStartTrial: lab.availableActions.canStartTrial,
      canSelectPlan: lab.availableActions.canSelectPlan,
      canStartCheckout: lab.availableActions.canStartCheckout,
      canRequestInvoice: lab.availableActions.canRequestInvoice,
      canViewInvoice: lab.availableActions.canViewInvoice,
      canDownloadInvoice: lab.availableActions.canDownloadInvoice,
      canContactSupport: lab.availableActions.canContactSupport,
    },
  };
}
