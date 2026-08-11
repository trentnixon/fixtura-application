import type { BillingInvoiceRequestWithdrawTarget } from "../../_types/invoice-request/billingInvoiceRequestWithdraw";
import type { InvoiceRequestSummary } from "@/types/api/account";

export function invoiceRequestToWithdrawTarget(
  request: InvoiceRequestSummary,
): BillingInvoiceRequestWithdrawTarget | null {
  const rawId = request.invoiceRequestId ?? (request.id != null ? String(request.id) : "");
  const invoiceRequestId = rawId.trim();
  if (!invoiceRequestId) return null;

  const target: BillingInvoiceRequestWithdrawTarget = { invoiceRequestId };
  if (request.submittedAt !== undefined) {
    target.submittedAt = request.submittedAt;
  }
  if (request.requestedStartDate !== undefined) {
    target.requestedStartDate = request.requestedStartDate;
  }
  if (request.status !== undefined) {
    target.status = request.status;
  }
  return target;
}
