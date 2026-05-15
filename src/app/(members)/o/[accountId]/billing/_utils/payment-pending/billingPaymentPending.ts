import { normalizeBillingCode } from "../overview/billingSummaryLabels";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

/** Raw invoice-request status codes; used with `orderShowsPaymentPending` for banner copy (see `hasPaymentPending` in `core/billing-state.ts`). */
const INVOICE_REQUEST_PENDING_CODES = new Set<string>([
  "pending",
  "submitted",
  "processing",
  "under_review",
  "invoice_under_review",
  "awaiting_review",
]);

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
  const stripe = normalizedStatus(row.stripeStatus ?? "");
  if (stripe && ORDER_STRIPE_PENDING.has(stripe)) return true;
  const pay = normalizedStatus(row.paymentStatus ?? "");
  if (pay && ORDER_PAYMENT_PENDING.has(pay)) return true;
  const checkout = normalizedStatus(row.checkoutStatus ?? "");
  if (
    checkout === "open" ||
    checkout === "incomplete" ||
    checkout === "invoice_issued" ||
    checkout.includes("pending")
  ) {
    return true;
  }
  return false;
}

/**
 * Active order checkout has moved past "preparing invoice" - invoice was sent; payment not complete.
 * When GET /billing omits `activeOrder`, pass `orders` from GET /orders/account so `invoice_issued` is visible.
 */
export function isInvoiceIssuedCheckout(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): boolean {
  const o = summary.activeOrder;
  if (o && normalizedStatus(o.checkout_status ?? "") === "invoice_issued") {
    return true;
  }
  if (!orders?.length) return false;
  return orders.some((row) => normalizedStatus(row.checkoutStatus ?? "") === "invoice_issued");
}

/**
 * True when CMS marks `latestInvoiceRequest.status` as one of the configured in-flight codes (or contains pending/review).
 * For UI copy, combine with `orderShowsPaymentPending`; `hasPaymentPending()` in `billing-state.ts` ignores invoice status alone.
 */
export function isPendingInvoiceRequestStatus(status: string | null | undefined): boolean {
  const invStatus = normalizedStatus(status ?? "");
  if (!invStatus) return false;
  if (INVOICE_REQUEST_PENDING_CODES.has(invStatus)) return true;
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
    const stripe = normalizedStatus(o.stripe_status ?? "");
    if (stripe && ORDER_STRIPE_PENDING.has(stripe)) return true;

    const pay = normalizedStatus(o.payment_status ?? "");
    if (pay && ORDER_PAYMENT_PENDING.has(pay)) return true;

    const checkout = normalizedStatus(o.checkout_status ?? "");
    if (
      checkout === "open" ||
      checkout === "incomplete" ||
      checkout === "invoice_issued" ||
      checkout.includes("pending")
    ) {
      return true;
    }

    return false;
  }

  if (!orders?.length) return false;
  return orders.some(orderHistoryRowIndicatesPaymentPending);
}

export type PaymentPendingBannerVariant = "invoice" | "checkout";

export function paymentPendingBannerVariant(
  summary: AccountBillingSummaryV1,
  orders?: AccountBillingOrderHistoryDto[] | null,
): PaymentPendingBannerVariant {
  if (isInvoiceIssuedCheckout(summary, orders)) {
    return "invoice";
  }
  const channel = summary.currentPlan?.paymentChannel;
  if (channel === "stripe") {
    return "checkout";
  }
  if (channel === "invoice") {
    return "invoice";
  }
  if (
    isPendingInvoiceRequestStatus(summary.latestInvoiceRequest?.status) &&
    orderShowsPaymentPending(summary, orders)
  ) {
    return "invoice";
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
      eyebrow: "Invoice request pending",
      title: "We're preparing your invoice",
      body: "We've received your pass and billing details. Our team is creating the invoice now. When it is ready, we will send it to the billing email from your request. Access activates once payment is received, using the start date you selected.",
    };
  }
  return {
    variant,
    eyebrow: "Payment pending",
    title: "Your checkout or payment isn't finished yet",
    body: "We are still waiting for payment to complete. If you were paying by card, use Continue payment to reopen checkout. If this attempt is no longer needed, discard it where available. Contact support if the payment path is unclear.",
  };
}
