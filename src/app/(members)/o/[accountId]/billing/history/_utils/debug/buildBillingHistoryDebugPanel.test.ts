import { describe, expect, it } from "vitest";

import { buildBillingHistoryDebugPanel } from "./buildBillingHistoryDebugPanel";
import { resolveHighlightedHistoryOrder } from "../pickHighlightedHistoryOrder";

import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
} from "@/types/api/account";

function baseSummary(overrides: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "active",
    accessStatus: "active",
    currentPlan: {
      id: "14",
      name: "Season Pass",
      description: "Full season coverage",
      category: "Club",
      price: 650,
      currency: "AUD",
      daysInPass: 365,
      isActive: true,
      includeSponsors: false,
      includedAssetTypes: [],
      orderId: null,
      paymentChannel: null,
    },
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: { status: "cancelled" },
    availableActions: { canContactSupport: true },
    ...overrides,
  };
}

function baseHistoryOrder(
  overrides: Partial<AccountBillingOrderHistoryDto> = {},
): AccountBillingOrderHistoryDto {
  return {
    id: 457,
    name: "Season Pass",
    status: null,
    currency: "AUD",
    total: "65000",
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
    subscriptionTier: { id: 14, name: "Season Pass", price: 650, currency: "AUD" },
    ...overrides,
  };
}

describe("resolveHighlightedHistoryOrder", () => {
  it("matches by stripe subscription id first", () => {
    const activeOrder: AccountBillingOrderDto = {
      id: 999,
      Name: null,
      total: null,
      currency: null,
      OrderPaid: null,
      payment_status: null,
      checkout_status: null,
      payment_channel: "stripe",
      startOrderAt: null,
      endOrderAt: null,
      isActive: true,
      isPaused: false,
      cancel_at_period_end: null,
      stripe_subscription_id: "sub_abc",
      stripe_status: null,
      hosted_invoice_url: null,
      invoice_pdf: null,
      invoice_number: null,
      invoice_due_date: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      subscriptionTier: null,
    };

    const result = resolveHighlightedHistoryOrder(
      [
        baseHistoryOrder({ id: 457 }),
        baseHistoryOrder({ id: 455, stripeSubscriptionId: "sub_other" }),
      ],
      activeOrder,
    );

    expect(result.matchReason).toBe("stripe_subscription_id");
    expect(result.order?.id).toBe(457);
  });
});

describe("buildBillingHistoryDebugPanel", () => {
  it("surfaces order-history entitlement and cents normalization", () => {
    const orders = [baseHistoryOrder()];
    const { sections } = buildBillingHistoryDebugPanel({
      summary: baseSummary(),
      orders,
      ordersMetaCount: 5,
      invoiceRequests: [{ status: "cancelled", submittedAt: "2026-04-01T00:00:00.000Z" }],
      ordersLoadError: false,
      invoiceWithdrawError: null,
      cancelInvoiceRequestPending: false,
      queryStatuses: { billing: "ok", invoiceRequests: "ok", orders: "ok" },
    });

    const alignment = sections.find((section) => section.title === "Alignment");
    const ordersSection = sections.find((section) => section.title === "Orders");

    expect(alignment?.entries["entitlementSource"]).toBe("order_history");
    expect(ordersSection?.entries["highlightedOrderRawTotal"]).toBe(65000);
    expect(ordersSection?.entries["highlightedOrderDisplayTotal"]).toBe(650);
    expect(ordersSection?.entries["highlightedOrderTotalNormalizedFromCents"]).toBe("true");
  });

  it("includes per-query statuses in context extra", () => {
    const { extra } = buildBillingHistoryDebugPanel({
      summary: baseSummary(),
      orders: [],
      ordersMetaCount: null,
      invoiceRequests: [],
      ordersLoadError: false,
      invoiceWithdrawError: null,
      cancelInvoiceRequestPending: false,
      queryStatuses: { billing: "ok", invoiceRequests: "ok", orders: "pending" },
    });

    expect(extra["billingQueryStatus"]).toBe("ok");
    expect(extra["ordersQueryStatus"]).toBe("pending");
  });
});
