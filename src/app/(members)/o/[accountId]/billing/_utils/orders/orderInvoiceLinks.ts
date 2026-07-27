import { historyRowMatchesSummaryActiveOrder } from "./billingHistoryOrderUtils";
import { sanitizeInvoiceUrl } from "./invoiceOrderState";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export type OrderInvoiceLinks = {
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
};

export function isStripePaymentChannel(channel: string | null | undefined): boolean {
  return channel?.trim().toLowerCase() === "stripe";
}

export function extractInvoiceLinksFromSummaryOrder(
  order: AccountBillingOrderDto | null | undefined,
): OrderInvoiceLinks {
  if (!order) {
    return { hostedInvoiceUrl: null, invoicePdfUrl: null };
  }

  return {
    hostedInvoiceUrl: sanitizeInvoiceUrl(order.hosted_invoice_url),
    invoicePdfUrl: sanitizeInvoiceUrl(order.invoice_pdf),
  };
}

export function extractInvoiceLinksFromHistoryOrder(
  order: AccountBillingOrderHistoryDto,
): OrderInvoiceLinks {
  return {
    hostedInvoiceUrl: sanitizeInvoiceUrl(order.hostedInvoiceUrl ?? order.hosted_invoice_url),
    invoicePdfUrl: sanitizeInvoiceUrl(order.invoicePdfUrl ?? order.invoice_pdf),
  };
}

/**
 * Hosted invoice / PDF URLs on the history row or billing summary active order.
 * Supports Stripe and manual invoice-channel orders when CMS exposes URLs per order.
 */
export function resolveHistoryOrderInvoiceLinks(
  order: AccountBillingOrderHistoryDto,
  activeOrder: AccountBillingOrderDto | null,
): OrderInvoiceLinks {
  const fromRow = extractInvoiceLinksFromHistoryOrder(order);
  if (fromRow.hostedInvoiceUrl || fromRow.invoicePdfUrl) {
    return fromRow;
  }

  if (activeOrder && historyRowMatchesSummaryActiveOrder(order, activeOrder)) {
    return extractInvoiceLinksFromSummaryOrder(activeOrder);
  }

  return { hostedInvoiceUrl: null, invoicePdfUrl: null };
}

/** Invoice links for the paid-active status card (summary first, then matching/active history row). */
export function resolvePaidActiveInvoiceLinks(
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): OrderInvoiceLinks {
  if (activeOrder) {
    const fromSummary = extractInvoiceLinksFromSummaryOrder(activeOrder);
    if (fromSummary.hostedInvoiceUrl || fromSummary.invoicePdfUrl) {
      return fromSummary;
    }
  }

  const list = orders ?? [];
  const highlighted =
    (activeOrder
      ? list.find((row) => historyRowMatchesSummaryActiveOrder(row, activeOrder))
      : null) ??
    list.find((row) => row.isActive) ??
    null;

  if (highlighted) {
    return resolveHistoryOrderInvoiceLinks(highlighted, activeOrder);
  }

  return { hostedInvoiceUrl: null, invoicePdfUrl: null };
}
