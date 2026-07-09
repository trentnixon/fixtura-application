import { historyRowMatchesSummaryActiveOrder } from "./billingHistoryOrderUtils";

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

  const hosted = order.hosted_invoice_url?.trim() ?? "";
  const pdf = order.invoice_pdf?.trim() ?? "";
  return {
    hostedInvoiceUrl: hosted !== "" ? hosted : null,
    invoicePdfUrl: pdf !== "" ? pdf : null,
  };
}

export function extractInvoiceLinksFromHistoryOrder(
  order: AccountBillingOrderHistoryDto,
): OrderInvoiceLinks {
  const hosted = (order.hostedInvoiceUrl ?? order.hosted_invoice_url)?.trim() ?? "";
  const pdf = (order.invoicePdfUrl ?? order.invoice_pdf)?.trim() ?? "";
  return {
    hostedInvoiceUrl: hosted !== "" ? hosted : null,
    invoicePdfUrl: pdf !== "" ? pdf : null,
  };
}

/**
 * Stripe-backed orders may expose hosted invoice / PDF URLs on the history row or billing summary active order.
 * Non-Stripe invoice flows are intentionally omitted until CMS exposes a stable contract per order.
 */
export function resolveHistoryOrderInvoiceLinks(
  order: AccountBillingOrderHistoryDto,
  activeOrder: AccountBillingOrderDto | null,
): OrderInvoiceLinks {
  if (!isStripePaymentChannel(order.paymentChannel)) {
    return { hostedInvoiceUrl: null, invoicePdfUrl: null };
  }

  const fromRow = extractInvoiceLinksFromHistoryOrder(order);
  if (fromRow.hostedInvoiceUrl || fromRow.invoicePdfUrl) {
    return fromRow;
  }

  if (activeOrder && historyRowMatchesSummaryActiveOrder(order, activeOrder)) {
    return extractInvoiceLinksFromSummaryOrder(activeOrder);
  }

  return { hostedInvoiceUrl: null, invoicePdfUrl: null };
}

/** Invoice links for the paid-active status card (summary first, then matching/active Stripe history row). */
export function resolvePaidActiveInvoiceLinks(
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): OrderInvoiceLinks {
  if (activeOrder && isStripePaymentChannel(activeOrder.payment_channel)) {
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
    list.find((row) => row.isActive && isStripePaymentChannel(row.paymentChannel)) ??
    null;

  if (highlighted) {
    return resolveHistoryOrderInvoiceLinks(highlighted, activeOrder);
  }

  return { hostedInvoiceUrl: null, invoicePdfUrl: null };
}
