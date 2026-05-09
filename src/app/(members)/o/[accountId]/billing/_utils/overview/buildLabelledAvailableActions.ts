import { BILLING_INVOICE_AVAILABLE_ACTION_KEYS } from "./availableActionsUiGate";
import { labelForAvailableAction } from "./billingSummaryLabels";

import type { BillingUiMode } from "../../_core/billing-state";
import type { LabelledAvailableAction } from "../../_types/overview/billingSections";

export type BuildLabelledAvailableActionsOptions = {
  /** Omit invoice-request actions when the UI is already in a paid-active state. */
  billingUiMode?: BillingUiMode;
};

export function buildLabelledAvailableActions(
  availableActions: Partial<Record<string, boolean>> | null | undefined,
  options?: BuildLabelledAvailableActionsOptions,
): LabelledAvailableAction[] {
  const actionsSafe = availableActions ?? {};
  const out: LabelledAvailableAction[] = [];
  for (const [key, v] of Object.entries(actionsSafe)) {
    if (v !== true) {
      continue;
    }
    if (
      options?.billingUiMode === "paid_active" &&
      BILLING_INVOICE_AVAILABLE_ACTION_KEYS.has(key)
    ) {
      continue;
    }
    const label = labelForAvailableAction(key);
    if (label) {
      out.push({ key, label });
    }
  }
  return out;
}
