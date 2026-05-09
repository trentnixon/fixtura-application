/** Invoice-request flags from CMS; hidden in paid-active UI surfaces (see `buildLabelledAvailableActions`). */
export const BILLING_INVOICE_AVAILABLE_ACTION_KEYS = new Set<string>([
  "canRequestInvoice",
  "can_request_invoice",
]);

/**
 * Keys that are `true` on the billing summary, after the same mode gate we use for
 * “Available actions” on the overview (e.g. omit invoice when `paid_active`).
 */
export function trueAvailableActionKeysAfterBillingUiMode(
  availableActions: Partial<Record<string, boolean>> | null | undefined,
  billingUiMode: string,
): string[] {
  const keys = Object.entries(availableActions ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k);
  if (billingUiMode !== "paid_active") {
    return keys;
  }
  return keys.filter((k) => !BILLING_INVOICE_AVAILABLE_ACTION_KEYS.has(k));
}
