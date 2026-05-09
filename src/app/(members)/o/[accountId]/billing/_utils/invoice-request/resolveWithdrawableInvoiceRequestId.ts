import type { AccountBillingSummaryV1 } from "@/types/api/account";

function invoiceRequestWireId(
  latest: NonNullable<AccountBillingSummaryV1["latestInvoiceRequest"]>,
): string | null {
  const id = latest.invoiceRequestId ?? (latest.id != null ? String(latest.id) : "");
  const t = id.trim();
  return t !== "" ? t : null;
}

/**
 * Strapi id for POST …/billing/invoice-requests/:id/cancel when summary allows withdrawal.
 * Requires `canWithdrawInvoiceRequest` and `latestInvoiceRequest.canWithdraw === true`.
 */
export function resolveWithdrawableInvoiceRequestId(
  summary: AccountBillingSummaryV1,
): string | null {
  if (summary.availableActions?.["canWithdrawInvoiceRequest"] !== true) {
    return null;
  }
  const latest = summary.latestInvoiceRequest;
  if (!latest || latest.canWithdraw !== true) {
    return null;
  }
  return invoiceRequestWireId(latest);
}
