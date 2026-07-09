import { describe, expect, it } from "vitest";

import {
  extractInvoiceLinksFromHistoryOrder,
  extractInvoiceLinksFromSummaryOrder,
  resolveHistoryOrderInvoiceLinks,
  resolvePaidActiveInvoiceLinks,
} from "./orderInvoiceLinks";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

function baseHistoryOrder(
  overrides: Partial<AccountBillingOrderHistoryDto> = {},
): AccountBillingOrderHistoryDto {
  return {
    id: 457,
    name: "Season Pass",
    status: null,
    currency: "AUD",
    total: "650",
    isPaid: true,
    paymentStatus: null,
    checkoutStatus: null,
    paymentChannel: "stripe",
    isActive: true,
    isPaused: false,
    cancelAtPeriodEnd: false,
    stripeStatus: "active",
    stripeSubscriptionId: "sub_abc",
    startAt: "2026-05-16T00:00:00.000Z",
    endAt: "2027-05-16T00:00:00.000Z",
    createdAt: "2026-05-16",
    updatedAt: "2026-05-16",
    subscriptionTier: null,
    ...overrides,
  };
}

function baseSummaryOrder(overrides: Partial<AccountBillingOrderDto> = {}): AccountBillingOrderDto {
  return {
    id: 457,
    Name: "Season Pass",
    total: 650,
    currency: "AUD",
    OrderPaid: true,
    payment_status: null,
    checkout_status: null,
    payment_channel: "stripe",
    startOrderAt: "2026-05-16T00:00:00.000Z",
    endOrderAt: "2027-05-16T00:00:00.000Z",
    isActive: true,
    isPaused: false,
    cancel_at_period_end: false,
    stripe_subscription_id: "sub_abc",
    stripe_status: "active",
    hosted_invoice_url: "https://invoice.stripe.com/i/test",
    invoice_pdf: "https://pay.stripe.com/invoice/test/pdf",
    invoice_number: null,
    invoice_due_date: null,
    createdAt: "2026-05-16",
    updatedAt: "2026-05-16",
    subscriptionTier: null,
    ...overrides,
  };
}

describe("resolveHistoryOrderInvoiceLinks", () => {
  it("returns no links for non-Stripe orders", () => {
    expect(
      resolveHistoryOrderInvoiceLinks(
        baseHistoryOrder({
          paymentChannel: "manual",
          hostedInvoiceUrl: "https://example.com/invoice",
        }),
        null,
      ),
    ).toEqual({ hostedInvoiceUrl: null, invoicePdfUrl: null });
  });

  it("prefers URLs on the history row for Stripe orders", () => {
    expect(
      resolveHistoryOrderInvoiceLinks(
        baseHistoryOrder({
          hostedInvoiceUrl: "https://invoice.stripe.com/i/row",
          invoicePdfUrl: "https://pay.stripe.com/invoice/row/pdf",
        }),
        null,
      ),
    ).toEqual({
      hostedInvoiceUrl: "https://invoice.stripe.com/i/row",
      invoicePdfUrl: "https://pay.stripe.com/invoice/row/pdf",
    });
  });

  it("reads raw Strapi invoice URL fields on Stripe history rows", () => {
    expect(
      resolveHistoryOrderInvoiceLinks(
        baseHistoryOrder({
          hosted_invoice_url: "https://invoice.stripe.com/i/raw",
          invoice_pdf: "https://pay.stripe.com/invoice/raw/pdf",
        }),
        null,
      ),
    ).toEqual({
      hostedInvoiceUrl: "https://invoice.stripe.com/i/raw",
      invoicePdfUrl: "https://pay.stripe.com/invoice/raw/pdf",
    });
  });

  it("falls back to summary active order when the row matches", () => {
    const activeOrder = baseSummaryOrder();
    expect(resolveHistoryOrderInvoiceLinks(baseHistoryOrder({ id: 457 }), activeOrder)).toEqual({
      hostedInvoiceUrl: "https://invoice.stripe.com/i/test",
      invoicePdfUrl: "https://pay.stripe.com/invoice/test/pdf",
    });
  });
});

describe("resolvePaidActiveInvoiceLinks", () => {
  it("uses summary active order URLs first", () => {
    expect(resolvePaidActiveInvoiceLinks(baseSummaryOrder(), [])).toEqual(
      extractInvoiceLinksFromSummaryOrder(baseSummaryOrder()),
    );
  });

  it("falls back to a matching Stripe history row", () => {
    expect(
      resolvePaidActiveInvoiceLinks(
        baseSummaryOrder({ hosted_invoice_url: null, invoice_pdf: null }),
        [
          baseHistoryOrder({
            hostedInvoiceUrl: "https://invoice.stripe.com/i/history",
            invoicePdfUrl: null,
          }),
        ],
      ),
    ).toEqual({
      hostedInvoiceUrl: "https://invoice.stripe.com/i/history",
      invoicePdfUrl: null,
    });
  });
});

describe("extractInvoiceLinksFromHistoryOrder", () => {
  it("trims empty strings to null", () => {
    expect(
      extractInvoiceLinksFromHistoryOrder(
        baseHistoryOrder({ hostedInvoiceUrl: "  ", invoicePdfUrl: "" }),
      ),
    ).toEqual({ hostedInvoiceUrl: null, invoicePdfUrl: null });
  });
});
