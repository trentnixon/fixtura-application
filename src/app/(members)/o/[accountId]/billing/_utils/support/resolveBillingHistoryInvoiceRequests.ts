import type { AccountBillingSummaryV1, InvoiceRequestSummary } from "@/types/api/account";

export function resolveBillingHistoryInvoiceRequests({
  isSupportView,
  summary,
  listFromQuery,
}: {
  isSupportView: boolean;
  summary: AccountBillingSummaryV1 | null;
  listFromQuery: InvoiceRequestSummary[];
}): InvoiceRequestSummary[] {
  if (!isSupportView) {
    return listFromQuery;
  }

  const latest = summary?.latestInvoiceRequest;
  return latest ? [latest] : [];
}
