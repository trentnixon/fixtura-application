import { describe, expect, it } from "vitest";

import { resolveDeletablePendingOrderId } from "./resolveDeletablePendingOrderId";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

function baseSummary(overrides: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "x",
    accessStatus: "active",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: {},
    ...overrides,
  };
}

function tierPlan(
  overrides: Partial<NonNullable<AccountBillingSummaryV1["currentPlan"]>>,
): NonNullable<AccountBillingSummaryV1["currentPlan"]> {
  return {
    id: "1",
    name: "t",
    description: "",
    category: "Club",
    price: 0,
    currency: "AUD",
    daysInPass: 1,
    isActive: true,
    includeSponsors: false,
    includedAssetTypes: [],
    orderId: null,
    paymentChannel: null,
    ...overrides,
  };
}

function stripeOrderRow(id: number, checkoutStatus: string): AccountBillingOrderHistoryDto {
  return {
    id,
    name: null,
    status: null,
    currency: null,
    total: null,
    isPaid: false,
    paymentStatus: null,
    checkoutStatus,
    paymentChannel: "stripe",
    isActive: false,
    isPaused: false,
    cancelAtPeriodEnd: false,
    stripeStatus: null,
    stripeSubscriptionId: null,
    startAt: null,
    endAt: null,
    createdAt: "",
    updatedAt: "",
    subscriptionTier: null,
  };
}

describe("resolveDeletablePendingOrderId", () => {
  it("returns null when canDeletePendingOrder is not true", () => {
    expect(
      resolveDeletablePendingOrderId(
        baseSummary({
          availableActions: { ["canDeletePendingOrder"]: false },
          currentPlan: tierPlan({
            orderId: "99",
            paymentChannel: "stripe",
          }),
        }),
      ),
    ).toBeNull();
  });

  it("returns null when only canWithdrawInvoiceRequest is true (not a CMS discard flag yet)", () => {
    expect(
      resolveDeletablePendingOrderId(
        baseSummary({
          availableActions: { ["canWithdrawInvoiceRequest"]: true },
          currentPlan: tierPlan({
            orderId: "15",
            paymentChannel: "invoice",
          }),
        }),
      ),
    ).toBeNull();
  });

  it("prefers currentPlan.orderId when Stripe and canDeletePendingOrder", () => {
    const summary = baseSummary({
      availableActions: { ["canDeletePendingOrder"]: true },
      currentPlan: tierPlan({
        orderId: "42",
        paymentChannel: "stripe",
      }),
    });
    expect(resolveDeletablePendingOrderId(summary, [stripeOrderRow(100, "incomplete")])).toBe("42");
  });

  it("falls back to first Stripe incomplete row when currentPlan is null", () => {
    const summary = baseSummary({
      availableActions: { ["canDeletePendingOrder"]: true },
      currentPlan: null,
    });
    const orders: AccountBillingOrderHistoryDto[] = [
      stripeOrderRow(77, "open"),
      stripeOrderRow(88, "incomplete"),
    ];
    expect(resolveDeletablePendingOrderId(summary, orders)).toBe("88");
  });

  it("ignores invoice-channel rows even when canDeletePendingOrder is true", () => {
    const summary = baseSummary({
      availableActions: { ["canDeletePendingOrder"]: true },
      currentPlan: null,
    });
    const orders: AccountBillingOrderHistoryDto[] = [
      {
        ...stripeOrderRow(201, "incomplete"),
        paymentChannel: "invoice",
      },
    ];
    expect(resolveDeletablePendingOrderId(summary, orders)).toBeNull();
  });

  it("returns null when flag true but no matching Stripe incomplete row", () => {
    expect(
      resolveDeletablePendingOrderId(
        baseSummary({
          availableActions: { ["canDeletePendingOrder"]: true },
          currentPlan: null,
        }),
        [],
      ),
    ).toBeNull();
  });
});
