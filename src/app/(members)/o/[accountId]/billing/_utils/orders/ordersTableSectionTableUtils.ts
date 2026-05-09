import {
  historyRowMatchesSummaryActiveOrder,
  normalizeHistoryOrderKey,
} from "./billingHistoryOrderUtils";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export function getOrdersTableRowKey(order: AccountBillingOrderHistoryDto, index: number): string {
  return `${normalizeHistoryOrderKey(order) || "order"}-${index}`;
}

/** Invoice URLs come from billing summary `activeOrder` only; gated to the history row that matches it. */
export function getOrdersTableInvoiceLinks(
  order: AccountBillingOrderHistoryDto,
  activeOrder: AccountBillingOrderDto | null,
): { hostedInvoiceUrl: string | null; invoicePdfUrl: string | null } {
  if (!activeOrder || !historyRowMatchesSummaryActiveOrder(order, activeOrder)) {
    return { hostedInvoiceUrl: null, invoicePdfUrl: null };
  }
  const hosted = activeOrder.hosted_invoice_url?.trim() ?? "";
  const pdf = activeOrder.invoice_pdf?.trim() ?? "";
  return {
    hostedInvoiceUrl: hosted !== "" ? hosted : null,
    invoicePdfUrl: pdf !== "" ? pdf : null,
  };
}
