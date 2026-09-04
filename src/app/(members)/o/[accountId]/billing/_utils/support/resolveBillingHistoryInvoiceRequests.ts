import type { InvoiceRequestSummary } from "@/types/api/account";

/** Invoice history uses the invoice-requests list GET for all viewers (including support). */
export function resolveBillingHistoryInvoiceRequests({
  listFromQuery,
}: {
  listFromQuery: InvoiceRequestSummary[];
}): InvoiceRequestSummary[] {
  return listFromQuery;
}
