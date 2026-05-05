/** Route lab billing — shapes aligned with fixtura-billing-labs-pdr.md §5. */

/** Mock trial length for billing lab (`state=trial_available` → Start trial). */
export const BILLING_LAB_TRIAL_DAYS = 14;

export type LabAccessStatus = "pending" | "active" | "restricted" | "cancelled";

export type LabBillingStatus =
  | "not_started"
  | "trial_available"
  | "trialing"
  | "trial_ended"
  | "checkout_started"
  | "payment_pending"
  | "payment_failed"
  | "invoice_requested"
  | "invoice_under_review"
  | "invoice_sent"
  | "active"
  | "expired"
  | "cancelled";

export type LabBillingTier = {
  id: string;
  name: string;
  description: string;
  category: "Club" | "Association";
  price: number;
  currency: string;
  daysInPass: number;
  priceByWeekInPass?: number;
  /** Short subtitle (e.g. Quick Play, Season Starter). */
  tagline?: string;
  /** Display line for coverage window (e.g. "30 Days Covered"). */
  coverageLabel?: string;
  /** Promotional line (e.g. "6 month + 6 months free"). */
  promoLine?: string;
  isActive: boolean;
  includeSponsors: boolean;
  includedAssetTypes: string[];
  packageName?: string;
  stripePriceId?: string;
  labOnly: true;
};

export type LabBillingSummary = {
  accountId: string;
  accountName: string;
  accessStatus: LabAccessStatus;
  billingStatus: LabBillingStatus;
  currentPlan: LabBillingTier | null;
  trial: {
    isEligible: boolean;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
  };
  activeOrder: {
    id: string;
    status: string;
    paymentStatus: string;
    startDate: string | null;
    endDate: string | null;
    daysRemaining: number | null;
    hostedInvoiceUrl: string | null;
    invoicePdf: string | null;
    labOnly: true;
  } | null;
  latestInvoiceRequest: {
    id: string;
    status: string;
    submittedAt: string;
    selectedPlanName: string;
    labOnly: true;
  } | null;
  availableActions: {
    canStartTrial: boolean;
    canSelectPlan: boolean;
    canStartCheckout: boolean;
    canRequestInvoice: boolean;
    canViewInvoice: boolean;
    canDownloadInvoice: boolean;
    canContactSupport: boolean;
  };
};

export type MockCheckoutResponse = {
  checkoutSessionId: string;
  checkoutUrl: null;
  orderId: string;
  labOnly: true;
};

export type MockInvoiceRequestResponse = {
  invoiceRequestId: string;
  status: "submitted";
  submittedAt: string;
  message: string;
  labOnly: true;
};

export type LabCheckoutPayload = {
  tierId: string;
  tierName: string;
  requestedStartDate: string;
};

export type LabInvoiceRequestPayload = {
  tierId: string;
  tierName: string;
  requestedStartDate: string;
  organisationLegalName: string;
  billingEmail: string;
  notes: string;
};

export const BILLING_LAB_SCENARIO_OPTIONS = [
  "default",
  "not_started",
  "trial_available",
  "trial_active",
  "trial_ended",
  "plan_selected",
  "checkout_started",
  "payment_pending",
  "payment_failed",
  "invoice_requested",
  "invoice_under_review",
  "invoice_sent",
  "active_season",
  "expired_season",
  "cancelled",
] as const;

/** Route lab billing UI: subscribe wizard vs subscribed account snapshot. */
export const BILLING_LAB_MODES = ["wizard", "active"] as const;
export type BillingLabMode = (typeof BILLING_LAB_MODES)[number];

export type BillingLabScenarioParam = (typeof BILLING_LAB_SCENARIO_OPTIONS)[number];

export const BILLING_LAB_PATH_TRACKER_STEPS = [
  "View billing",
  "Select plan",
  "Choose start date",
  "Choose payment method",
  "Card checkout started",
  "Stripe return simulated",
  "Invoice request submitted",
  "Billing state refreshed",
] as const;

export type BillingLabPathStepId = (typeof BILLING_LAB_PATH_TRACKER_STEPS)[number];

export type LabReturnSimulationState =
  | "payment_ok"
  | "payment_processing"
  | "payment_not_found"
  | "cancelled";
