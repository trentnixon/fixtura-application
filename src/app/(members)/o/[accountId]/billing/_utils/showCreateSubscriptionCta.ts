import { shouldShowInvoiceRequest } from "../invoice-request/billing-invoice-request";
import { shouldShowPlanCheckout } from "../plan-checkout/billing-plan-checkout";

import type { BillingUiMode } from "../core/billing-state";

export function showCreateSubscriptionCta(
  mode: BillingUiMode,
  availableActions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (mode === "paid_active" || mode === "free_trial_available" || mode === "payment_pending") {
    return false;
  }
  return shouldShowPlanCheckout(availableActions) || shouldShowInvoiceRequest(availableActions);
}
