export const BILLING_STATUS_TRIAL_AVAILABLE = "trial_available";

export const BILLING_STATUS_TRIAL = new Set<string>([
  "trial",
  "trialing",
  "active_trial",
  "free_trial",
]);

export const ACCESS_STATUS_TRIAL = new Set<string>(["trial", "trial_access"]);

export const ORDER_STRIPE_PENDING = new Set<string>([
  "incomplete",
  "incomplete_expired",
  "requires_payment_method",
  "requires_action",
  "requires_confirmation",
]);

export const ORDER_PAYMENT_PENDING = new Set<string>(["unpaid", "pending", "processing"]);

export const ACCESS_DENIED_CODES = new Set<string>(["denied", "locked", "none"]);

export const BILLING_UNPAID_STRESS = new Set<string>(["unpaid", "past_due"]);

export const BILLING_PAID_SIGNALS = new Set<string>(["active", "paid", "paid_active"]);

export const ACCESS_PAID_SIGNALS = new Set<string>(["granted", "full", "active"]);

export const ORDER_PENDING_CHECKOUT_STATUSES = new Set<string>([
  "open",
  "incomplete",
  // `invoice_issued` alone is not pending — use isInvoiceAwaitingPayment (unpaid + inactive).
]);

export const DAY_IN_MS = 86400000;
