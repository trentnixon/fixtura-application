/**
 * Static label maps for GET /billing presentation.
 * Unknown codes fall back to humanised text in `_utils/overview/billingSummaryLabels`.
 * Extend maps when CMS stabilises enum values.
 */

export const BILLING_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  trial_available: "Trial available",
  trial_active: "Trial active",
  trial_ended: "Trial ended",
  trialing: "Trial active",
  trial: "Trial",
  active_trial: "Active trial",
  free_trial: "Free trial",
  past_due: "Past due",
  canceled: "Canceled",
  cancelled: "Cancelled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  incomplete_expired: "Incomplete (expired)",
  paused: "Paused",
  pending: "Pending",
  none: "None",
  paid: "Paid",
};

export const ACCESS_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  granted: "Access granted",
  denied: "Access denied",
  restricted: "Access restricted",
  full: "Full access",
  trial: "Trial access",
  trial_access: "Trial access",
  none: "No access",
  active: "Active",
  inactive: "Inactive",
  locked: "Locked",
};

/**
 * Labels for `availableActions` keys. Unmapped keys are omitted from the UI (see billing-content).
 * Add entries when the CMS contract lists stable action flag names.
 */
export const BILLING_AVAILABLE_ACTION_LABELS: Record<string, string> = {
  canSubscribe: "Subscribe to a plan",
  can_checkout: "Pay by card",
  canCheckout: "Pay by card",
  can_start_checkout: "Pay by card",
  canStartCheckout: "Pay by card",
  can_request_invoice: "Request invoice billing",
  canRequestInvoice: "Request invoice billing",
  canManageBilling: "Manage billing",
  can_manage_billing: "Manage billing",
  canChangePlan: "Change plan",
  can_change_plan: "Change plan",
  canCancel: "Cancel subscription",
  can_cancel: "Cancel subscription",
  canStartTrial: "Start free trial",
  can_start_trial: "Start free trial",
  canContactSupport: "Contact support",
  can_contact_support: "Contact support",
};
