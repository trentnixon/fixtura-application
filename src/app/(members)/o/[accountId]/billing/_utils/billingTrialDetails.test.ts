import { describe, expect, it } from "vitest";

import { billingTrialDetailsTriggerState } from "./billingTrialDetails";

import type { AccountBillingOrderHistoryDto, AccountBillingSummaryV1 } from "@/types/api/account";

function minimalOrderRow(
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

describe("billingTrialDetailsTriggerState", () => {
  const ref = new Date("2026-05-10T12:00:00.000Z");

  it("returns null for paid_active from orders only (no summary activeOrder)", () => {
    const summary: AccountBillingSummaryV1 = {
      billingStatus: "invoice_requested",
      accessStatus: "pending",
      currentPlan: null,
      trial: { isActive: false, endDate: "2026-05-06T00:00:00.000Z" },
      activeOrder: null,
      latestInvoiceRequest: { status: "submitted", submittedAt: "2026-05-06T00:00:00.000Z" },
      availableActions: { canRequestInvoice: true },
    };
    const orders = [minimalOrderRow({ isPaid: true, isActive: true, checkoutStatus: "active" })];
    expect(
      billingTrialDetailsTriggerState(summary, "paid_active", {
        referenceDate: ref,
        orders,
      }),
    ).toBeNull();
  });
});
