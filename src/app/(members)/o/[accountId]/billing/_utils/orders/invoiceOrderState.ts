import { isOrderPaidAwaitingStart } from "./orderSeasonPassDisplayState";
import { normalizeBillingCode } from "../overview/billingSummaryLabels";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

/** Normalized order slice used by invoice lifecycle selectors (summary + history). */
export type InvoiceOrderStateInput = {
  checkoutStatus: string | null;
  paymentStatus: string | null;
  /** True when CMS marks the order paid (`isPaid` / `OrderPaid` / `orderPaid`). */
  orderPaid: boolean;
  isActive: boolean;
  startOrderAt: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  paymentChannel: string | null;
};

export type InvoiceOrderPresentation = {
  awaitingPayment: boolean;
  paidActive: boolean;
  cancelled: boolean;
  /** Current payable invoice (awaiting payment + valid hosted URL). */
  showPayAction: boolean;
  /** Historical or secondary document links (hosted and/or PDF when valid). */
  showDocumentLinks: boolean;
  statusLabel: string;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  /** True when field combination is contradictory / incomplete for unlock. */
  inconsistent: boolean;
};

const ORDER_PAYMENT_UNPAID = new Set<string>(["unpaid", "pending", "processing"]);
const ORDER_CHECKOUT_CANCELLED = new Set<string>(["cancelled", "canceled", "incomplete_expired"]);
const ORDER_PAYMENT_CANCELLED = new Set<string>(["cancelled", "canceled"]);

function normalizedStatus(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return normalizeBillingCode(value);
}

/** Accept absolute http(s) URLs only; blank/invalid → null. */
export function sanitizeInvoiceUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function hasHostedInvoice(order: Pick<InvoiceOrderStateInput, "hostedInvoiceUrl">): boolean {
  return sanitizeInvoiceUrl(order.hostedInvoiceUrl) != null;
}

export function hasInvoicePdf(order: Pick<InvoiceOrderStateInput, "invoicePdfUrl">): boolean {
  return sanitizeInvoiceUrl(order.invoicePdfUrl) != null;
}

function readPaidFlag(value: unknown): boolean {
  return value === true;
}

export function toInvoiceOrderStateFromHistory(
  order: AccountBillingOrderHistoryDto,
): InvoiceOrderStateInput {
  const hosted = sanitizeInvoiceUrl(order.hostedInvoiceUrl ?? order.hosted_invoice_url);
  const pdf = sanitizeInvoiceUrl(order.invoicePdfUrl ?? order.invoice_pdf);
  const orderPaid = readPaidFlag(order.isPaid) || readPaidFlag(order.orderPaid);

  return {
    checkoutStatus: order.checkoutStatus ?? null,
    paymentStatus: order.paymentStatus ?? null,
    orderPaid,
    isActive: order.isActive === true,
    startOrderAt: order.startAt ?? null,
    hostedInvoiceUrl: hosted,
    invoicePdfUrl: pdf,
    paymentChannel: order.paymentChannel ?? null,
  };
}

export function toInvoiceOrderStateFromSummary(
  order: AccountBillingOrderDto,
): InvoiceOrderStateInput {
  return {
    checkoutStatus: order.checkout_status ?? null,
    paymentStatus: order.payment_status ?? null,
    orderPaid: readPaidFlag(order.OrderPaid),
    isActive: order.isActive === true,
    startOrderAt: order.startOrderAt ?? null,
    hostedInvoiceUrl: sanitizeInvoiceUrl(order.hosted_invoice_url),
    invoicePdfUrl: sanitizeInvoiceUrl(order.invoice_pdf),
    paymentChannel: order.payment_channel ?? null,
  };
}

function isUnpaidPaymentStatus(paymentStatus: string): boolean {
  if (!paymentStatus) return true;
  if (ORDER_PAYMENT_UNPAID.has(paymentStatus)) return true;
  if (paymentStatus === "paid") return false;
  return ORDER_PAYMENT_CANCELLED.has(paymentStatus);
}

/**
 * Invoice issued and still awaiting payment — full authoritative AND.
 * Does not use invoice-request status strings.
 */
export function isInvoiceAwaitingPayment(order: InvoiceOrderStateInput): boolean {
  const checkout = normalizedStatus(order.checkoutStatus);
  if (checkout !== "invoice_issued") return false;
  if (order.orderPaid === true) return false;
  if (order.isActive === true) return false;

  const pay = normalizedStatus(order.paymentStatus);
  if (pay === "paid") return false;
  return isUnpaidPaymentStatus(pay);
}

/**
 * Conservative paid + active entitlement for invoice/order lifecycle.
 * Requires paymentStatus paid, paid flag, isActive, and a completed checkout
 * (`active` from invoice paid transition, or `complete` for Stripe-style rows).
 */
export function isInvoiceOrderPaidAndActive(order: InvoiceOrderStateInput): boolean {
  const checkout = normalizedStatus(order.checkoutStatus);
  const pay = normalizedStatus(order.paymentStatus);

  if (order.isActive !== true) return false;
  if (order.orderPaid !== true) return false;
  if (pay !== "paid") return false;
  if (checkout !== "active" && checkout !== "complete") return false;
  return true;
}

/**
 * Cancelled / cleaned-up invoice order — not awaiting payment and not active.
 * Requires an explicit cancel-like checkout or payment signal from CMS.
 */
export function isInvoiceOrderCancelled(order: InvoiceOrderStateInput): boolean {
  if (isInvoiceAwaitingPayment(order)) return false;
  if (isInvoiceOrderPaidAndActive(order)) return false;
  if (order.isActive === true) return false;
  if (order.orderPaid === true) return false;

  const checkout = normalizedStatus(order.checkoutStatus);
  const pay = normalizedStatus(order.paymentStatus);

  if (ORDER_CHECKOUT_CANCELLED.has(checkout)) return true;
  if (ORDER_PAYMENT_CANCELLED.has(pay)) return true;
  return false;
}

function detectInconsistent(order: InvoiceOrderStateInput): boolean {
  const checkout = normalizedStatus(order.checkoutStatus);
  const pay = normalizedStatus(order.paymentStatus);

  if (checkout === "invoice_issued" && pay === "paid") return true;
  if ((checkout === "active" || checkout === "complete") && order.orderPaid === false) return true;
  if (pay === "unpaid" && order.isActive === true) return true;
  if (order.orderPaid === true && pay === "unpaid") return true;
  if (order.orderPaid === true && order.isActive === false && pay === "paid") {
    if (
      isOrderPaidAwaitingStart({
        orderPaid: order.orderPaid,
        isActive: order.isActive,
        paymentStatus: order.paymentStatus,
        checkoutStatus: order.checkoutStatus,
        startOrderAt: order.startOrderAt,
        endOrderAt: null,
      })
    ) {
      return false;
    }
    return true;
  }
  return false;
}

export function getInvoiceOrderPresentation(
  order: InvoiceOrderStateInput,
): InvoiceOrderPresentation {
  const hostedInvoiceUrl = sanitizeInvoiceUrl(order.hostedInvoiceUrl);
  const invoicePdfUrl = sanitizeInvoiceUrl(order.invoicePdfUrl);
  const inconsistent = detectInconsistent(order);

  const awaitingPayment = !inconsistent && isInvoiceAwaitingPayment(order);
  const paidActive = !inconsistent && isInvoiceOrderPaidAndActive(order);
  const cancelled = !inconsistent && isInvoiceOrderCancelled(order);

  const hasAnyUrl = hostedInvoiceUrl != null || invoicePdfUrl != null;
  const showPayAction = awaitingPayment && hostedInvoiceUrl != null;
  /** Document links whenever URLs exist; pay CTA is separate for hosted while awaiting. */
  const showDocumentLinks = hasAnyUrl;

  let statusLabel = "—";
  if (awaitingPayment) {
    statusLabel = "Invoice issued — awaiting payment";
  } else if (paidActive) {
    statusLabel = "Paid";
  } else if (cancelled) {
    statusLabel = "Cancelled";
  } else {
    const checkout = normalizedStatus(order.checkoutStatus);
    const pay = normalizedStatus(order.paymentStatus);
    if (checkout === "invoice_issued") {
      statusLabel = "Invoice issued";
    } else if (pay) {
      statusLabel = pay;
    } else if (checkout) {
      statusLabel = checkout;
    }
  }

  return {
    awaitingPayment,
    paidActive,
    cancelled,
    showPayAction,
    showDocumentLinks,
    statusLabel,
    hostedInvoiceUrl,
    invoicePdfUrl,
    inconsistent,
  };
}

/** True when any order in the list is awaiting invoice payment. */
export function hasInvoiceAwaitingPaymentInOrders(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): boolean {
  if (!orders?.length) return false;
  return orders.some((row) => isInvoiceAwaitingPayment(toInvoiceOrderStateFromHistory(row)));
}

/** True when any history row is conservatively paid + active. */
export function hasInvoicePaidActiveInOrders(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): boolean {
  if (!orders?.length) return false;
  return orders.some((row) => isInvoiceOrderPaidAndActive(toInvoiceOrderStateFromHistory(row)));
}
