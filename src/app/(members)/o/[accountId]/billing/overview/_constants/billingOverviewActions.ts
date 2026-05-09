import type { BillingUiMode } from "../../_core/billing-state";

export const BILLING_HISTORY_VISIBLE_MODES: BillingUiMode[] = [
  "paid_active",
  "active_trial",
  "payment_pending",
];

export const ACTIVE_TRIAL_CREATE_SUBSCRIPTION_LABEL = "Subscribe or request invoice";
export const DEFAULT_CREATE_SUBSCRIPTION_LABEL = "Create subscription";
