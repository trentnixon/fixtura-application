import {
  isInvoiceAwaitingPayment,
  toInvoiceOrderStateFromHistory,
  toInvoiceOrderStateFromSummary,
} from "../orders/invoiceOrderState";
import { normalizeBillingCode } from "../overview/billingSummaryLabels";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

/** Kept in sync with order branch of `hasPaymentPending()` in `core/billing-state.ts`. */
const ORDER_STRIPE_PENDING = new Set<string>([
  "incomplete",
  "incomplete_expired",
  "requires_payment_method",
  "requires_action",
  "requires_confirmation",
]);

const ORDER_PAYMENT_PENDING = new Set<string>(["unpaid", "pending", "processing"]);

function normalizedStatus(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return normalizeBillingCode(value);
}

function orderHistoryRowIndicatesPaymentPending(row: AccountBillingOrderHistoryDto): boolean {
  if (isInvoiceAwaitingPayment(toInvoiceOrderStateFromHistory(row))) {
    return true;
  }

  const stripe = normalizedStatus(row.stripeStatus ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) return true;

  const pay = normalizedStatus(row.paymentStatus ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
    const checkout = normalizedStatus(row.checkoutStatus ?? "");
    if (checkout === "cancelled" || checkout === "canceled" || checkout === "incomplete_expired") {
      return false;
    }
    if (row.isPaid === true || row.isActive === true) return false;
    return true;
  }

  const checkout = normalizedStatus(row.checkoutStatus ?? "");
  if (checkout === "open" || checkout === "incomplete" || checkout.includes("pending")) {
    return true;
  }
  return false;
}

/**
 * Active order (or order history) is in the issued / unpaid / inactive invoice state.
 * Prefer this over invoice-request status strings for Member awaiting-payment UI.
 */
export function isInvoiceIssuedCheckout(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): boolean {
  const o = summary.activeOrder;
  if (o && isInvoiceAwaitingPayment(toInvoiceOrderStateFromSummary(o))) {
    return true;
  }
  if (!orders?.length) return false;
  return orders.some((row) => isInvoiceAwaitingPayment(toInvoiceOrderStateFromHistory(row)));
}

/**
 * @deprecated Invoice-request status must not drive entitlements or awaiting-payment banners.
 * Retained for debug/tests only; prefer order-derived `isInvoiceIssuedCheckout` / `isInvoiceAwaitingPayment`.
 */
export function isPendingInvoiceRequestStatus(status: string | null | undefined): boolean {
  const invStatus = normalizedStatus(status ?? "");
  if (!invStatus) return false;
  if (
    invStatus === "pending" ||
    invStatus === "submitted" ||
    invStatus === "processing" ||
    invStatus === "under_review" ||
    invStatus === "invoice_under_review" ||
    invStatus === "awaiting_review" ||
    invStatus === "invoice_received"
  ) {
    return true;
  }
  if (invStatus.includes("pending") || invStatus.includes("review")) return true;
  return false;
}

/**
 * True when `activeOrder` or order history signals incomplete checkout / payment (matches `hasPaymentPending` order checks).
 */
export function orderShowsPaymentPending(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): boolean {
  const o = summary.activeOrder;
  if (o) {
    if (isInvoiceAwaitingPayment(toInvoiceOrderStateFromSummary(o))) {
      return true;
    }

    const stripe = normalizedStatus(o.stripe_status ?? "");
    if (stripe && ORDER_STRIPE_PENDING.has(stripe)) return true;

    const pay = normalizedStatus(o.payment_status ?? "");
    if (pay && ORDER_PAYMENT_PENDING.has(pay)) {
      const checkout = normalizedStatus(o.checkout_status ?? "");
      if (
        checkout === "cancelled" ||
        checkout === "canceled" ||
        checkout === "incomplete_expired"
      ) {
        return false;
      }
      if (o.OrderPaid === true || o.isActive === true) return false;
      return true;
    }

    const checkout = normalizedStatus(o.checkout_status ?? "");
    if (checkout === "open" || checkout === "incomplete" || checkout.includes("pending")) {
      return true;
    }

    return false;
  }

  if (!orders?.length) return false;
  return orders.some(orderHistoryRowIndicatesPaymentPending);
}

export type PaymentPendingBannerVariant = "invoice" | "checkout";

/**
 * Banner variant from authoritative order state only (not invoice-request status strings).
 */
export function paymentPendingBannerVariant(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): PaymentPendingBannerVariant {
  if (isInvoiceIssuedCheckout(summary, orders)) {
    return "invoice";
  }
  const channel = summary.currentPlan?.paymentChannel;
  if (channel === "invoice") {
    return "invoice";
  }
  if (channel === "stripe") {
    return "checkout";
  }
  return "checkout";
}

export type PaymentPendingBannerCopy = {
  variant: PaymentPendingBannerVariant;
  eyebrow: string;
  title: string;
  body: string;
};

export function paymentPendingBannerCopy(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): PaymentPendingBannerCopy {
  if (isInvoiceIssuedCheckout(summary, orders)) {
    return {
      variant: "invoice",
      eyebrow: "Invoice issued",
      title: "We've sent your invoice - awaiting payment",
      body: "Your invoice has been issued to the billing contact on your request. Complete payment using the instructions in that email. If it has not arrived, check spam or contact support. Your organisation's access will activate once payment is received.",
    };
  }

  const variant = paymentPendingBannerVariant(summary, orders);
  if (variant === "invoice") {
    return {
      variant,
      eyebrow: "Payment pending",
      title: "Your invoice payment isn't finished yet",
      body: "We are still waiting for payment to complete on your invoice order. Access activates once payment is confirmed. Contact support if the payment path is unclear.",
    };
  }
  return {
    variant,
    eyebrow: "Payment pending",
    title: "Your checkout or payment isn't finished yet",
    body: "We are still waiting for payment to complete. If you were paying by card, use Continue payment to reopen checkout. If this attempt is no longer needed, discard it where available. Contact support if the payment path is unclear.",
  };
}
