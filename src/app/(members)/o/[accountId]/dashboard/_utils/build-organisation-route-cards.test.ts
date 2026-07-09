import { describe, expect, it } from "vitest";

import { buildBillingRouteCard } from "./build-organisation-route-cards";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

function baseSummary(over: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "none",
    accessStatus: "none",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    availableActions: {},
    ...over,
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

describe("buildBillingRouteCard", () => {
  it("maps paid_active to plan metrics and manage billing CTA", () => {
    const view = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "paid_active",
      productState: "active_account",
      billingSummary: baseSummary({
        activeOrder: {
          id: 10,
          Name: "Season pass",
          startOrderAt: "2026-05-01T00:00:00.000Z",
          endOrderAt: "2026-06-01T00:00:00.000Z",
          cancel_at_period_end: false,
          subscriptionTier: { id: 1, Name: "Club Pro", Title: "Club Pro" },
        },
        currentPlan: { id: 1, name: "Club Pro" },
      }),
      orders: [
        minimalHistoryOrder({
          isPaid: true,
          isActive: true,
          startAt: "2026-05-01T00:00:00.000Z",
          endAt: "2026-06-01T00:00:00.000Z",
        }),
      ],
    });

    expect(view.href).toBe("/o/575/billing");
    expect(view.ctaLabel).toBe("Manage billing");
    expect(view.primaryMetric).toEqual({ label: "Plan", value: "Club Pro" });
    expect(view.secondaryMetric?.label).toBe("Remaining");
    expect(view.detailRows.some((row) => row.label === "Period ends")).toBe(true);
    expect(view.progressPercent).not.toBeNull();
    expect(view.showEndingNotice).toBe(false);
  });

  it("maps active_trial to trial metrics", () => {
    const view = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "active_trial",
      productState: "active_account",
      billingSummary: baseSummary({
        trial: {
          isActive: true,
          startDate: "2026-05-01",
          endDate: "2026-05-25",
          subscriptionTier: { id: 1, name: "Trial tier" },
        },
      }),
      orders: [],
    });

    expect(view.ctaLabel).toBe("View billing");
    expect(view.primaryMetric).toEqual({ label: "Trial", value: "Trial tier" });
    expect(view.secondaryMetric?.label).toBe("Remaining");
    expect(view.detailRows.some((row) => row.label === "Trial ends")).toBe(true);
  });

  it("maps payment_pending to continue on billing CTA", () => {
    const view = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "payment_pending",
      productState: "pending",
      billingSummary: baseSummary(),
      orders: [],
    });

    expect(view.href).toBe("/o/575/billing");
    expect(view.ctaLabel).toBe("Continue on billing");
    expect(view.primaryMetric.value).toBe("Pending");
  });

  it("maps funnel modes to create subscription href", () => {
    const expired = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "trial_expired",
      productState: "create_subscription",
      billingSummary: baseSummary(),
      orders: [],
    });
    const noBilling = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "no_billing",
      productState: "create_subscription",
      billingSummary: baseSummary(),
      orders: [],
    });

    expect(expired.href).toBe("/o/575/billing/create");
    expect(expired.ctaLabel).toBe("Create subscription");
    expect(noBilling.href).toBe("/o/575/billing/create");
  });

  it("sets ending notice when subscription cancels at period end", () => {
    const view = buildBillingRouteCard({
      accountId: "575",
      billingUiMode: "paid_active",
      productState: "active_account",
      billingSummary: baseSummary({
        activeOrder: {
          id: 10,
          Name: "Season pass",
          startOrderAt: "2026-05-01T00:00:00.000Z",
          endOrderAt: "2026-06-01T00:00:00.000Z",
          cancel_at_period_end: true,
        },
      }),
      orders: [],
    });

    expect(view.showEndingNotice).toBe(true);
    expect(view.endingNoticeText).toContain("Subscription ending");
  });
});
