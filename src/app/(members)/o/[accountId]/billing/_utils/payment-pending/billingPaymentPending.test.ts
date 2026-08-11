import { describe, expect, it } from "vitest";

import {
  isPendingInvoiceRequestStatus,
  orderShowsPaymentPending,
  paymentPendingBannerCopy,
  paymentPendingBannerVariant,
} from "./billingPaymentPending";

import type {
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  BillingSummaryCurrentPlan,
} from "@/types/api/account";

function minimalSummaryCurrentPlan(
  overrides: Partial<BillingSummaryCurrentPlan> = {},
): BillingSummaryCurrentPlan {
  return {
    id: "t1",
    name: "Club Season",
    description: "",
    category: "Club",
    price: 100,
    currency: "AUD",
    daysInPass: 30,
    isActive: true,
    includeSponsors: false,
    includedAssetTypes: [],
    orderId: null,
    paymentChannel: null,
    ...overrides,
  };
}

function minimalHistoryOrder(
  overrides: Partial<AccountBillingOrderHistoryDto> = {},
): AccountBillingOrderHistoryDto {
  return {
    id: 1,
    name: null,
    status: null,
    currency: "AUD",
    total: "100",
    isPaid: false,
    paymentStatus: null,
    checkoutStatus: null,
    paymentChannel: null,
    isActive: false,
    isPaused: false,
    cancelAtPeriodEnd: false,
    stripeStatus: null,
    stripeSubscriptionId: null,
    startAt: null,
    endAt: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    subscriptionTier: null,
    ...overrides,
  };
}

function emptySummary(overrides: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "pending",
    accessStatus: "pending",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    ...overrides,
  };
}

describe("isPendingInvoiceRequestStatus", () => {
  it("returns true for submitted and other CMS pending codes", () => {
    expect(isPendingInvoiceRequestStatus("submitted")).toBe(true);
    expect(isPendingInvoiceRequestStatus("pending")).toBe(true);
    expect(isPendingInvoiceRequestStatus("under_review")).toBe(true);
    expect(isPendingInvoiceRequestStatus("awaiting_review")).toBe(true);
  });

  it("returns true when normalised code includes pending or review", () => {
    expect(isPendingInvoiceRequestStatus("Something-Pending")).toBe(true);
    expect(isPendingInvoiceRequestStatus("in review")).toBe(true);
  });

  it("returns false for empty or approved-like states", () => {
    expect(isPendingInvoiceRequestStatus(null)).toBe(false);
    expect(isPendingInvoiceRequestStatus("")).toBe(false);
    expect(isPendingInvoiceRequestStatus("paid")).toBe(false);
  });
});

describe("paymentPendingBannerVariant / copy", () => {
  it("uses checkout variant when only latest invoice request is pending (no corroborating order/checkout)", () => {
    const summary = emptySummary({
      latestInvoiceRequest: { status: "submitted" },
    });
    expect(paymentPendingBannerVariant(summary)).toBe("checkout");
    const copy = paymentPendingBannerCopy(summary);
    expect(copy.variant).toBe("checkout");
    expect(copy.title.toLowerCase()).toContain("payment");
  });

  it("uses checkout variant when open checkout is in flight without invoice channel", () => {
    const summary = emptySummary({
      latestInvoiceRequest: { status: "submitted" },
      activeOrder: null,
    });
    const orders = [minimalHistoryOrder({ checkoutStatus: "open" })];
    expect(paymentPendingBannerVariant(summary, orders)).toBe("checkout");
    const copy = paymentPendingBannerCopy(summary, orders);
    expect(copy.variant).toBe("checkout");
    expect(copy.title.toLowerCase()).toContain("payment");
  });

  it("uses checkout variant when only order signals are pending", () => {
    const summary = emptySummary({
      latestInvoiceRequest: null,
      activeOrder: {
        id: 1,
        Name: null,
        total: null,
        currency: null,
        OrderPaid: null,
        payment_status: null,
        checkout_status: null,
        payment_channel: null,
        startOrderAt: null,
        endOrderAt: null,
        isActive: false,
        isPaused: false,
        cancel_at_period_end: null,
        stripe_subscription_id: null,
        stripe_status: "incomplete",
        hosted_invoice_url: null,
        invoice_pdf: null,
        invoice_number: null,
        invoice_due_date: null,
        createdAt: "",
        updatedAt: "",
        subscriptionTier: null,
      },
    });
    expect(paymentPendingBannerVariant(summary)).toBe("checkout");
    const copy = paymentPendingBannerCopy(summary);
    expect(copy.variant).toBe("checkout");
    expect(copy.title.toLowerCase()).toContain("payment");
  });

  it("uses invoice variant and issued copy when checkout_status is invoice_issued", () => {
    const summary = emptySummary({
      latestInvoiceRequest: {
        status: "invoice_created",
        submittedAt: "2026-05-05",
      },
      activeOrder: {
        id: 1,
        Name: null,
        total: null,
        currency: null,
        OrderPaid: false,
        payment_status: "unpaid",
        checkout_status: "invoice_issued",
        payment_channel: null,
        startOrderAt: null,
        endOrderAt: null,
        isActive: false,
        isPaused: false,
        cancel_at_period_end: null,
        stripe_subscription_id: null,
        stripe_status: null,
        hosted_invoice_url: null,
        invoice_pdf: null,
        invoice_number: null,
        invoice_due_date: null,
        createdAt: "",
        updatedAt: "",
        subscriptionTier: null,
      },
    });
    expect(paymentPendingBannerVariant(summary)).toBe("invoice");
    const copy = paymentPendingBannerCopy(summary);
    expect(copy.variant).toBe("invoice");
    expect(copy.eyebrow).toBe("Invoice issued");
    expect(copy.title).toContain("invoice");
    expect(copy.title.toLowerCase()).toContain("awaiting payment");
  });

  it("prefers invoice-issued copy from order history when summary omits activeOrder (latest request may still say submitted)", () => {
    const summary = emptySummary({
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-05" },
      activeOrder: null,
    });
    const orders = [
      minimalHistoryOrder({
        checkoutStatus: "invoice_issued",
        paymentStatus: "unpaid",
        isPaid: false,
        isActive: false,
      }),
    ];
    expect(paymentPendingBannerVariant(summary, orders)).toBe("invoice");
    const copy = paymentPendingBannerCopy(summary, orders);
    expect(copy.eyebrow).toBe("Invoice issued");
    expect(copy.title.toLowerCase()).toContain("awaiting payment");
  });

  it("uses checkout variant when currentPlan.paymentChannel is stripe and there is no order history", () => {
    const summary = emptySummary({
      activeOrder: null,
      currentPlan: minimalSummaryCurrentPlan({
        paymentChannel: "stripe",
        orderId: "ord_pending_1",
      }),
    });
    expect(paymentPendingBannerVariant(summary)).toBe("checkout");
    const copy = paymentPendingBannerCopy(summary);
    expect(copy.variant).toBe("checkout");
    expect(copy.title.toLowerCase()).toContain("payment");
  });

  it("uses invoice variant when currentPlan.paymentChannel is invoice without invoice_issued", () => {
    const summary = emptySummary({
      activeOrder: null,
      latestInvoiceRequest: null,
      currentPlan: minimalSummaryCurrentPlan({
        paymentChannel: "invoice",
        orderId: "ord_pending_2",
      }),
    });
    expect(paymentPendingBannerVariant(summary)).toBe("invoice");
    const copy = paymentPendingBannerCopy(summary);
    expect(copy.variant).toBe("invoice");
    expect(copy.eyebrow).toBe("Payment pending");
    expect(copy.eyebrow).not.toBe("Invoice issued");
    expect(copy.title.toLowerCase()).toContain("invoice");
  });
});

describe("orderShowsPaymentPending", () => {
  it("detects incomplete stripe subscription on activeOrder", () => {
    const summary = emptySummary({
      activeOrder: {
        id: 1,
        Name: null,
        total: null,
        currency: null,
        OrderPaid: null,
        payment_status: null,
        checkout_status: null,
        payment_channel: null,
        startOrderAt: null,
        endOrderAt: null,
        isActive: false,
        isPaused: false,
        cancel_at_period_end: null,
        stripe_subscription_id: null,
        stripe_status: "incomplete",
        hosted_invoice_url: null,
        invoice_pdf: null,
        invoice_number: null,
        invoice_due_date: null,
        createdAt: "",
        updatedAt: "",
        subscriptionTier: null,
      },
    });
    expect(orderShowsPaymentPending(summary)).toBe(true);
  });

  it("detects invoice_issued checkout on activeOrder when unpaid and inactive", () => {
    const summary = emptySummary({
      activeOrder: {
        id: 1,
        Name: null,
        total: null,
        currency: null,
        OrderPaid: false,
        payment_status: "unpaid",
        checkout_status: "invoice_issued",
        payment_channel: "invoice",
        startOrderAt: null,
        endOrderAt: null,
        isActive: false,
        isPaused: false,
        cancel_at_period_end: null,
        stripe_subscription_id: null,
        stripe_status: null,
        hosted_invoice_url: null,
        invoice_pdf: null,
        invoice_number: null,
        invoice_due_date: null,
        createdAt: "",
        updatedAt: "",
        subscriptionTier: null,
      },
    });
    expect(orderShowsPaymentPending(summary)).toBe(true);
  });

  it("detects invoice_issued on order history when activeOrder is absent", () => {
    const summary = emptySummary({ activeOrder: null });
    const orders = [
      minimalHistoryOrder({
        checkoutStatus: "invoice_issued",
        paymentStatus: "unpaid",
        isPaid: false,
        isActive: false,
      }),
    ];
    expect(orderShowsPaymentPending(summary, orders)).toBe(true);
  });

  it("does not treat cancelled unpaid orders as payment pending", () => {
    const summary = emptySummary({ activeOrder: null });
    const orders = [
      minimalHistoryOrder({
        checkoutStatus: "cancelled",
        paymentStatus: "unpaid",
        isPaid: false,
        isActive: false,
      }),
    ];
    expect(orderShowsPaymentPending(summary, orders)).toBe(false);
  });
});
