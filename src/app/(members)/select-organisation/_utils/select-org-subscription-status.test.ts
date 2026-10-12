import { describe, expect, it } from "vitest";

import {
  deriveSelectOrgSubscriptionStatus,
  selectOrgSubscriptionBadgeState,
} from "./select-org-subscription-status";

import type { AccountBillingOrderDto, AccountBillingSummaryV1 } from "@/types/api/account";

const referenceDate = new Date("2026-07-27T12:00:00+10:00");

function summary(over: Partial<AccountBillingSummaryV1> = {}): AccountBillingSummaryV1 {
  return {
    billingStatus: "none",
    accessStatus: "none",
    currentPlan: null,
    trial: null,
    activeOrder: null,
    latestInvoiceRequest: null,
    ...over,
  };
}

function paidOrder(over: Partial<AccountBillingOrderDto> = {}): AccountBillingOrderDto {
  return {
    id: 1,
    Name: "Season Pass",
    total: 100,
    currency: "AUD",
    OrderPaid: true,
    payment_status: "paid",
    checkout_status: "active",
    payment_channel: "stripe",
    startOrderAt: "2026-01-01",
    endOrderAt: "2026-09-01",
    isActive: true,
    isPaused: false,
    cancel_at_period_end: false,
    stripe_subscription_id: null,
    stripe_status: "active",
    hosted_invoice_url: null,
    invoice_pdf: null,
    invoice_number: null,
    invoice_due_date: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    subscriptionTier: null,
    ...over,
  };
}

describe("deriveSelectOrgSubscriptionStatus", () => {
  it("returns Active for an active trial", () => {
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({
          billingStatus: "active",
          accessStatus: "trial",
          trial: { isActive: true, endDate: "2026-08-20" },
        }),
        { referenceDate },
      ),
    ).toBe("active");
  });

  it("returns Active for a paid subscription that is not ending soon", () => {
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({
          billingStatus: "active",
          accessStatus: "active",
          activeOrder: paidOrder({ endOrderAt: "2026-09-01" }),
        }),
        { referenceDate },
      ),
    ).toBe("active");
  });

  it("returns Ending Soon when a paid active order ends within 7 days", () => {
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({
          billingStatus: "active",
          accessStatus: "active",
          activeOrder: paidOrder({ endOrderAt: "2026-07-30" }),
        }),
        { referenceDate },
      ),
    ).toBe("ending-soon");
  });

  it("returns Ending Soon when the current subscription will cancel at period end", () => {
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({
          billingStatus: "active",
          accessStatus: "active",
          activeOrder: paidOrder({
            endOrderAt: "2026-09-01",
            cancel_at_period_end: true,
          }),
        }),
        { referenceDate },
      ),
    ).toBe("ending-soon");
  });

  it("returns Ending Soon when an active trial is set to cancel at period end", () => {
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({
          billingStatus: "trialing",
          trial: { isActive: true, endDate: "2026-08-20" },
          activeOrder: paidOrder({
            OrderPaid: false,
            isActive: false,
            payment_status: null,
            checkout_status: null,
            stripe_status: null,
            endOrderAt: "2026-09-01",
            cancel_at_period_end: true,
          }),
        }),
        { referenceDate },
      ),
    ).toBe("ending-soon");
  });

  it("returns No Active Subscription when there is no current entitlement", () => {
    expect(deriveSelectOrgSubscriptionStatus(summary(), { referenceDate })).toBe("none");
    expect(
      deriveSelectOrgSubscriptionStatus(
        summary({ billingStatus: "trial_available", accessStatus: "pending" }),
        { referenceDate },
      ),
    ).toBe("none");
  });
});

describe("selectOrgSubscriptionBadgeState", () => {
  it("hides the badge while simulating", () => {
    expect(
      selectOrgSubscriptionBadgeState({
        simulating: true,
        isPending: false,
        isError: false,
        summary: summary(),
      }),
    ).toBeUndefined();
  });

  it("stays loading until billing returns", () => {
    expect(
      selectOrgSubscriptionBadgeState({
        simulating: false,
        isPending: true,
        isError: false,
        summary: undefined,
      }),
    ).toBe("loading");
  });

  it("hides the badge when billing fails", () => {
    expect(
      selectOrgSubscriptionBadgeState({
        simulating: false,
        isPending: false,
        isError: true,
        summary: undefined,
      }),
    ).toBeUndefined();
  });
});
