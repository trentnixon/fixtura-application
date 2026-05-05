/**
 * Presentation helpers for GET /billing — maps API codes to readable copy.
 * Extend maps when CMS stabilises enum values; unknown codes fall back to humanised text.
 */

export type BillingAccessBadgeVariant = "default" | "secondary" | "destructive" | "outline";

/** Normalise API status strings for dictionary lookup (case- and separator-agnostic). */
export function normalizeBillingCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function humanizeUnderscoreCode(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BILLING_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  trialing: "Trialing",
  trial: "Trial",
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

const ACCESS_STATUS_LABELS: Record<string, string> = {
  granted: "Access granted",
  denied: "Access denied",
  restricted: "Access restricted",
  full: "Full access",
  trial: "Trial access",
  none: "No access",
  active: "Active",
  inactive: "Inactive",
  locked: "Locked",
};

/**
 * User-facing label for `billingStatus`. Falls back to Title Case from snake_case.
 */
export function labelForBillingStatus(code: string): string {
  const k = normalizeBillingCode(code);
  return BILLING_STATUS_LABELS[k] ?? humanizeUnderscoreCode(k);
}

/**
 * User-facing label for `accessStatus`.
 */
export function labelForAccessStatus(code: string): string {
  const k = normalizeBillingCode(code);
  return ACCESS_STATUS_LABELS[k] ?? humanizeUnderscoreCode(k);
}

/**
 * Subtle badge treatment for access — avoid strong colours unless clearly denied.
 */
export function accessStatusBadgeVariant(code: string): BillingAccessBadgeVariant {
  const k = normalizeBillingCode(code);
  if (k.includes("denied") || k === "locked" || k === "none") {
    return "destructive";
  }
  if (k.includes("granted") || k === "full" || k === "active" || k === "trial") {
    return "secondary";
  }
  return "outline";
}

/**
 * Labels for `availableActions` keys. Unmapped keys are omitted from the UI (see billing-content).
 * Add entries when the CMS contract lists stable action flag names.
 */
export const BILLING_AVAILABLE_ACTION_LABELS: Record<string, string> = {
  canSubscribe: "Subscribe to a plan",
  can_checkout: "Pay by card",
  canCheckout: "Pay by card",
  can_request_invoice: "Request invoice billing",
  canRequestInvoice: "Request invoice billing",
  canManageBilling: "Manage billing",
  can_manage_billing: "Manage billing",
  canChangePlan: "Change plan",
  can_change_plan: "Change plan",
  canCancel: "Cancel subscription",
  can_cancel: "Cancel subscription",
};

function normalizeActionKey(key: string): string {
  return key.trim();
}

/**
 * Returns a user-facing label for an available-action flag, or `null` if unmapped.
 */
export function labelForAvailableAction(key: string): string | null {
  const raw = normalizeActionKey(key);
  if (BILLING_AVAILABLE_ACTION_LABELS[raw] !== undefined) {
    return BILLING_AVAILABLE_ACTION_LABELS[raw] ?? null;
  }
  const k = normalizeBillingCode(raw);
  const underscored = raw.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  return BILLING_AVAILABLE_ACTION_LABELS[k] ?? BILLING_AVAILABLE_ACTION_LABELS[underscored] ?? null;
}
