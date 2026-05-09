import { describe, expect, it } from "vitest";

import {
  getHistoryOrderStatus,
  getHistoryOrderSubscriptionDayCount,
  resolvePaidSubscriptionPeriodBounds,
} from "./billingHistoryOrderUtils";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

function baseOrder(
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

function baseSummaryOrder(overrides: Partial<AccountBillingOrderDto> = {}): AccountBillingOrderDto {
  return {
    id: 42,
    Name: null,
    total: null,
    currency: null,
    OrderPaid: null,
    payment_status: null,
    checkout_status: null,
    payment_channel: null,
    startOrderAt: null,
    endOrderAt: null,
    isActive: true,
    isPaused: false,
    cancel_at_period_end: null,
    stripe_subscription_id: "sub_test",
    stripe_status: "active",
    hosted_invoice_url: null,
    invoice_pdf: null,
    invoice_number: null,
    invoice_due_date: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    subscriptionTier: null,
    ...overrides,
  };
}

describe("resolvePaidSubscriptionPeriodBounds", () => {
  it("prefers full pair from billing summary activeOrder", () => {
    expect(
      resolvePaidSubscriptionPeriodBounds(
        baseSummaryOrder({
          startOrderAt: "2026-04-01T00:00:00.000Z",
          endOrderAt: "2026-05-01T00:00:00.000Z",
        }),
        [
          baseOrder({
            isPaid: true,
            isActive: true,
            startAt: "2026-03-01T00:00:00.000Z",
            endAt: "2026-04-01T00:00:00.000Z",
          }),
        ],
      ),
    ).toEqual({
      startIso: "2026-04-01T00:00:00.000Z",
      endIso: "2026-05-01T00:00:00.000Z",
    });
  });

  it("uses GET /orders startAt/endAt when summary omits period fields", () => {
    expect(
      resolvePaidSubscriptionPeriodBounds(
        baseSummaryOrder({ startOrderAt: null, endOrderAt: null }),
        [
          baseOrder({
            isPaid: true,
            isActive: true,
            id: 42,
            stripeSubscriptionId: "sub_test",
            startAt: "2026-04-10T00:00:00.000Z",
            endAt: "2026-05-10T00:00:00.000Z",
          }),
        ],
      ),
    ).toEqual({
      startIso: "2026-04-10T00:00:00.000Z",
      endIso: "2026-05-10T00:00:00.000Z",
    });
  });

  it("merges one bound from summary and the other from order history for the same subscription", () => {
    expect(
      resolvePaidSubscriptionPeriodBounds(
        baseSummaryOrder({
          startOrderAt: "2026-04-01T00:00:00.000Z",
          endOrderAt: null,
        }),
        [
          baseOrder({
            isPaid: true,
            isActive: true,
            id: 42,
            startAt: null,
            endAt: "2026-05-01T00:00:00.000Z",
          }),
        ],
      ),
    ).toEqual({
      startIso: "2026-04-01T00:00:00.000Z",
      endIso: "2026-05-01T00:00:00.000Z",
    });
  });
});

describe("getHistoryOrderSubscriptionDayCount", () => {
  it("returns null without startAt", () => {
    expect(getHistoryOrderSubscriptionDayCount(baseOrder())).toBeNull();
  });

  it("returns null when ended without endAt and not active", () => {
    expect(
      getHistoryOrderSubscriptionDayCount(
        baseOrder({
          startAt: "2026-05-01T00:00:00.000Z",
          endAt: null,
          isActive: false,
        }),
      ),
    ).toBeNull();
  });

  it("counts inclusive UTC calendar days from start to endAt", () => {
    expect(
      getHistoryOrderSubscriptionDayCount(
        baseOrder({
          startAt: "2026-05-01T12:00:00.000Z",
          endAt: "2026-05-10T08:00:00.000Z",
          isActive: false,
        }),
      ),
    ).toBe(10);
  });

  it("returns 1 when start and end fall on the same UTC calendar day", () => {
    expect(
      getHistoryOrderSubscriptionDayCount(
        baseOrder({
          startAt: "2026-05-01T02:00:00.000Z",
          endAt: "2026-05-01T22:00:00.000Z",
          isActive: false,
        }),
      ),
    ).toBe(1);
  });

  it("uses referenceDate as end when active and endAt is null", () => {
    const ref = new Date("2026-05-10T15:00:00.000Z");
    expect(
      getHistoryOrderSubscriptionDayCount(
        baseOrder({
          startAt: "2026-05-01T00:00:00.000Z",
          endAt: null,
          isActive: true,
        }),
        ref,
      ),
    ).toBe(10);
  });
});

describe("getHistoryOrderStatus", () => {
  it("displays Invoice issued for invoice_issued checkout when it is the shown status", () => {
    const order: AccountBillingOrderHistoryDto = {
      id: 1,
      name: null,
      status: null,
      currency: "AUD",
      total: "100",
      isPaid: false,
      paymentStatus: null,
      checkoutStatus: "invoice_issued",
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
    };
    expect(getHistoryOrderStatus(order)).toBe("Invoice issued");
  });

  it("prefers stripe status over checkout when both present", () => {
    const order: AccountBillingOrderHistoryDto = {
      id: 1,
      name: null,
      status: null,
      currency: "AUD",
      total: "100",
      isPaid: false,
      paymentStatus: null,
      checkoutStatus: "invoice_issued",
      paymentChannel: null,
      isActive: false,
      isPaused: false,
      cancelAtPeriodEnd: false,
      stripeStatus: "active",
      stripeSubscriptionId: null,
      startAt: null,
      endAt: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      subscriptionTier: null,
    };
    expect(getHistoryOrderStatus(order)).toBe("active");
  });
});
