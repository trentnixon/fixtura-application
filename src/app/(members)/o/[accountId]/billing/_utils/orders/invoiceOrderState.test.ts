import { describe, expect, it } from "vitest";

import {
  getInvoiceOrderPresentation,
  hasHostedInvoice,
  hasInvoicePdf,
  isInvoiceAwaitingPayment,
  isInvoiceOrderCancelled,
  isInvoiceOrderPaidAndActive,
  sanitizeInvoiceUrl,
  toInvoiceOrderStateFromHistory,
  type InvoiceOrderStateInput,
} from "./invoiceOrderState";

import type { AccountBillingOrderHistoryDto } from "@/types/api/account";

function baseState(overrides: Partial<InvoiceOrderStateInput> = {}): InvoiceOrderStateInput {
  return {
    checkoutStatus: null,
    paymentStatus: null,
    orderPaid: false,
    isActive: false,
    startOrderAt: null,
    hostedInvoiceUrl: null,
    invoicePdfUrl: null,
    paymentChannel: null,
    ...overrides,
  };
}

function baseHistory(
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
    paymentChannel: "invoice",
    isActive: false,
    isPaused: false,
    cancelAtPeriodEnd: false,
    stripeStatus: null,
    stripeSubscriptionId: null,
    startAt: null,
    endAt: null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    subscriptionTier: null,
    ...overrides,
  };
}

describe("sanitizeInvoiceUrl", () => {
  it("accepts absolute http(s) URLs", () => {
    expect(sanitizeInvoiceUrl("https://example.com/i")).toBe("https://example.com/i");
    expect(sanitizeInvoiceUrl("http://example.com/i")).toBe("http://example.com/i");
  });

  it("rejects blank, relative, and invalid URLs", () => {
    expect(sanitizeInvoiceUrl(null)).toBeNull();
    expect(sanitizeInvoiceUrl("")).toBeNull();
    expect(sanitizeInvoiceUrl("  ")).toBeNull();
    expect(sanitizeInvoiceUrl("/relative")).toBeNull();
    expect(sanitizeInvoiceUrl("not-a-url")).toBeNull();
    expect(sanitizeInvoiceUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("hasHostedInvoice / hasInvoicePdf", () => {
  it("detects hosted-only, PDF-only, both, and neither", () => {
    expect(hasHostedInvoice(baseState({ hostedInvoiceUrl: "https://a.example/i" }))).toBe(true);
    expect(hasInvoicePdf(baseState({ invoicePdfUrl: "https://a.example/i.pdf" }))).toBe(true);
    expect(
      hasHostedInvoice(
        baseState({
          hostedInvoiceUrl: "https://a.example/i",
          invoicePdfUrl: "https://a.example/i.pdf",
        }),
      ),
    ).toBe(true);
    expect(hasHostedInvoice(baseState())).toBe(false);
    expect(hasInvoicePdf(baseState({ invoicePdfUrl: "not-valid" }))).toBe(false);
  });
});

describe("isInvoiceAwaitingPayment", () => {
  it("is true for invoice_issued + unpaid + not paid + inactive", () => {
    expect(
      isInvoiceAwaitingPayment(
        baseState({
          checkoutStatus: "invoice_issued",
          paymentStatus: "unpaid",
          orderPaid: false,
          isActive: false,
        }),
      ),
    ).toBe(true);
  });

  it("is false when paid, active, orderPaid, or missing invoice_issued", () => {
    expect(
      isInvoiceAwaitingPayment(
        baseState({
          checkoutStatus: "invoice_issued",
          paymentStatus: "paid",
          orderPaid: false,
          isActive: false,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceAwaitingPayment(
        baseState({
          checkoutStatus: "invoice_issued",
          paymentStatus: "unpaid",
          orderPaid: false,
          isActive: true,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceAwaitingPayment(
        baseState({
          checkoutStatus: "invoice_issued",
          paymentStatus: "unpaid",
          orderPaid: true,
          isActive: false,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceAwaitingPayment(
        baseState({
          checkoutStatus: "incomplete",
          paymentStatus: "unpaid",
          orderPaid: false,
          isActive: false,
        }),
      ),
    ).toBe(false);
  });
});

describe("isInvoiceOrderPaidAndActive", () => {
  it("requires paid + orderPaid + isActive + active|complete checkout", () => {
    expect(
      isInvoiceOrderPaidAndActive(
        baseState({
          checkoutStatus: "active",
          paymentStatus: "paid",
          orderPaid: true,
          isActive: true,
        }),
      ),
    ).toBe(true);
    expect(
      isInvoiceOrderPaidAndActive(
        baseState({
          checkoutStatus: "complete",
          paymentStatus: "paid",
          orderPaid: true,
          isActive: true,
        }),
      ),
    ).toBe(true);
    expect(
      isInvoiceOrderPaidAndActive(
        baseState({
          checkoutStatus: "active",
          paymentStatus: "paid",
          orderPaid: true,
          isActive: false,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceOrderPaidAndActive(
        baseState({
          checkoutStatus: "active",
          paymentStatus: "paid",
          orderPaid: false,
          isActive: true,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceOrderPaidAndActive(
        baseState({
          checkoutStatus: "unknown",
          paymentStatus: "paid",
          orderPaid: true,
          isActive: true,
        }),
      ),
    ).toBe(false);
  });
});

describe("isInvoiceOrderCancelled", () => {
  it("detects cancel-like checkout/payment without granting awaiting or paid", () => {
    expect(
      isInvoiceOrderCancelled(
        baseState({
          checkoutStatus: "cancelled",
          paymentStatus: "unpaid",
          orderPaid: false,
          isActive: false,
          hostedInvoiceUrl: "https://example.com/invoice",
        }),
      ),
    ).toBe(true);
    expect(
      isInvoiceOrderCancelled(
        baseState({
          checkoutStatus: "incomplete_expired",
          paymentStatus: "canceled",
          orderPaid: false,
          isActive: false,
        }),
      ),
    ).toBe(true);
  });

  it("is false for awaiting-payment and paid-active rows", () => {
    expect(
      isInvoiceOrderCancelled(
        baseState({
          checkoutStatus: "invoice_issued",
          paymentStatus: "unpaid",
          orderPaid: false,
          isActive: false,
        }),
      ),
    ).toBe(false);
    expect(
      isInvoiceOrderCancelled(
        baseState({
          checkoutStatus: "active",
          paymentStatus: "paid",
          orderPaid: true,
          isActive: true,
        }),
      ),
    ).toBe(false);
  });
});

describe("getInvoiceOrderPresentation", () => {
  it("shows pay action only while awaiting payment with hosted URL", () => {
    const awaiting = getInvoiceOrderPresentation(
      baseState({
        checkoutStatus: "invoice_issued",
        paymentStatus: "unpaid",
        hostedInvoiceUrl: "https://example.com/pay",
        invoicePdfUrl: "https://example.com/i.pdf",
      }),
    );
    expect(awaiting.awaitingPayment).toBe(true);
    expect(awaiting.showPayAction).toBe(true);
    expect(awaiting.statusLabel).toContain("awaiting payment");

    const cancelled = getInvoiceOrderPresentation(
      baseState({
        checkoutStatus: "cancelled",
        paymentStatus: "unpaid",
        hostedInvoiceUrl: "https://example.com/pay",
      }),
    );
    expect(cancelled.cancelled).toBe(true);
    expect(cancelled.showPayAction).toBe(false);
    expect(cancelled.showDocumentLinks).toBe(true);
    expect(cancelled.statusLabel).toBe("Cancelled");
  });

  it("marks inconsistent combinations and suppresses awaiting/paid", () => {
    const inconsistent = getInvoiceOrderPresentation(
      baseState({
        checkoutStatus: "invoice_issued",
        paymentStatus: "paid",
        orderPaid: false,
        isActive: false,
      }),
    );
    expect(inconsistent.inconsistent).toBe(true);
    expect(inconsistent.awaitingPayment).toBe(false);
    expect(inconsistent.paidActive).toBe(false);
  });

  it("does not mark paid inactive complete with future start as inconsistent", () => {
    const presentation = getInvoiceOrderPresentation(
      baseState({
        checkoutStatus: "complete",
        paymentStatus: "paid",
        orderPaid: true,
        isActive: false,
        startOrderAt: "2099-01-01",
      }),
    );
    expect(presentation.inconsistent).toBe(false);
  });
});

describe("toInvoiceOrderStateFromHistory", () => {
  it("maps isPaid / orderPaid and sanitizes URLs", () => {
    const state = toInvoiceOrderStateFromHistory(
      baseHistory({
        isPaid: true,
        checkoutStatus: "complete",
        paymentStatus: "paid",
        isActive: true,
        hostedInvoiceUrl: "not-valid",
        invoicePdfUrl: "https://example.com/ok.pdf",
      }),
    );
    expect(state.orderPaid).toBe(true);
    expect(state.hostedInvoiceUrl).toBeNull();
    expect(state.invoicePdfUrl).toBe("https://example.com/ok.pdf");
  });
});
