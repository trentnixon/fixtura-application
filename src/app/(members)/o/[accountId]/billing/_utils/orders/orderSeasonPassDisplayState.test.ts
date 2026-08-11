import { describe, expect, it } from "vitest";

import {
  findPaidAwaitingStartOrder,
  formatAccountExpiringSoonStatus,
  formatPaidAwaitingStartStatus,
  isOrderEndingSoon,
  isOrderPaidAwaitingStart,
  parseOrderCalendarDate,
  resolveEndingSoonContext,
  resolveHistoryOrderSeasonPassStatus,
  shouldShowAccountExpiringSoonBanner,
  sydneyCalendarDayDiff,
  sydneyDaysUntil,
  toSeasonPassOrderDisplayFromHistory,
  type SeasonPassOrderDisplayInput,
} from "./orderSeasonPassDisplayState";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

const ref = new Date("2026-07-27T12:00:00+10:00");
const opts = { referenceDate: ref };

function baseDisplay(
  overrides: Partial<SeasonPassOrderDisplayInput> = {},
): SeasonPassOrderDisplayInput {
  return {
    orderPaid: false,
    isActive: false,
    paymentStatus: null,
    checkoutStatus: null,
    startOrderAt: null,
    endOrderAt: null,
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
    paymentChannel: "stripe",
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

describe("parseOrderCalendarDate", () => {
  it("extracts YYYY-MM-DD from ISO strings", () => {
    expect(parseOrderCalendarDate("2026-08-01T00:00:00.000Z")).toBe("2026-08-01");
    expect(parseOrderCalendarDate("2026-08-01")).toBe("2026-08-01");
  });

  it("returns null for invalid values", () => {
    expect(parseOrderCalendarDate(null)).toBeNull();
    expect(parseOrderCalendarDate("")).toBeNull();
    expect(parseOrderCalendarDate("bad")).toBeNull();
  });
});

describe("sydney calendar helpers", () => {
  it("computes day diff between YMD strings", () => {
    expect(sydneyCalendarDayDiff("2026-07-27", "2026-08-01")).toBe(5);
    expect(sydneyCalendarDayDiff("2026-07-27", "2026-07-27")).toBe(0);
  });

  it("computes days until target from Sydney today", () => {
    expect(sydneyDaysUntil("2026-08-01", opts)).toBe(5);
    expect(sydneyDaysUntil("2026-07-20", opts)).toBe(-7);
  });
});

describe("isOrderPaidAwaitingStart", () => {
  it("is true for paid complete inactive with future start", () => {
    expect(
      isOrderPaidAwaitingStart(
        baseDisplay({
          orderPaid: true,
          isActive: false,
          paymentStatus: "paid",
          checkoutStatus: "complete",
          startOrderAt: "2026-08-01T00:00:00.000Z",
        }),
        opts,
      ),
    ).toBe(true);
  });

  it("is false when start is today or past", () => {
    expect(
      isOrderPaidAwaitingStart(
        baseDisplay({
          orderPaid: true,
          isActive: false,
          paymentStatus: "paid",
          checkoutStatus: "complete",
          startOrderAt: "2026-07-27",
        }),
        opts,
      ),
    ).toBe(false);
  });

  it("is false without complete checkout or when active", () => {
    expect(
      isOrderPaidAwaitingStart(
        baseDisplay({
          orderPaid: true,
          isActive: false,
          paymentStatus: "paid",
          checkoutStatus: "active",
          startOrderAt: "2026-08-01",
        }),
        opts,
      ),
    ).toBe(false);
    expect(
      isOrderPaidAwaitingStart(
        baseDisplay({
          orderPaid: true,
          isActive: true,
          paymentStatus: "paid",
          checkoutStatus: "complete",
          startOrderAt: "2026-08-01",
        }),
        opts,
      ),
    ).toBe(false);
  });
});

describe("isOrderEndingSoon", () => {
  it("is true within 7 Sydney days including today", () => {
    expect(
      isOrderEndingSoon(
        baseDisplay({
          orderPaid: true,
          isActive: true,
          paymentStatus: "paid",
          checkoutStatus: "active",
          endOrderAt: "2026-08-03",
        }),
        opts,
      ),
    ).toBe(true);
    expect(
      isOrderEndingSoon(
        baseDisplay({
          orderPaid: true,
          isActive: true,
          paymentStatus: "paid",
          checkoutStatus: "active",
          endOrderAt: "2026-07-27",
        }),
        opts,
      ),
    ).toBe(true);
  });

  it("is false beyond 7 days or when inactive", () => {
    expect(
      isOrderEndingSoon(
        baseDisplay({
          orderPaid: true,
          isActive: true,
          paymentStatus: "paid",
          checkoutStatus: "active",
          endOrderAt: "2026-08-04",
        }),
        opts,
      ),
    ).toBe(false);
    expect(
      isOrderEndingSoon(
        baseDisplay({
          orderPaid: true,
          isActive: false,
          paymentStatus: "paid",
          checkoutStatus: "active",
          endOrderAt: "2026-07-30",
        }),
        opts,
      ),
    ).toBe(false);
  });
});

describe("copy formatters", () => {
  it("formats paid awaiting start with singular and plural days", () => {
    expect(formatPaidAwaitingStartStatus(1)).toBe("Order ready — starting in 1 day.");
    expect(formatPaidAwaitingStartStatus(5)).toBe("Order ready — starting in 5 days.");
  });

  it("formats account expiring soon copy", () => {
    expect(formatAccountExpiringSoonStatus(3)).toBe("Your account will expire in 3 days.");
    expect(formatAccountExpiringSoonStatus(1)).toBe("Your account will expire in 1 day.");
  });
});

describe("findPaidAwaitingStartOrder", () => {
  it("returns first matching history row", () => {
    const match = baseHistory({
      id: 495,
      isPaid: true,
      isActive: false,
      paymentStatus: "paid",
      checkoutStatus: "complete",
      startAt: "2026-08-01",
    });
    expect(findPaidAwaitingStartOrder([match], opts)).toEqual(match);
  });
});

describe("resolveEndingSoonContext", () => {
  it("returns days until end for active summary order", () => {
    const activeOrder = {
      id: 1,
      Name: "Pass",
      total: 100,
      currency: "AUD",
      OrderPaid: true,
      payment_status: "paid",
      checkout_status: "active",
      payment_channel: "stripe",
      startOrderAt: "2026-01-01",
      endOrderAt: "2026-07-30",
      isActive: true,
      isPaused: false,
      cancel_at_period_end: false,
      stripe_subscription_id: null,
      stripe_status: null,
      hosted_invoice_url: null,
      invoice_pdf: null,
      invoice_number: null,
      invoice_due_date: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      subscriptionTier: null,
    } satisfies AccountBillingOrderDto;

    const ctx = resolveEndingSoonContext(activeOrder, [], opts);
    expect(ctx).toEqual({ daysUntilEnd: 3, endIso: "2026-07-30" });
  });
});

describe("shouldShowAccountExpiringSoonBanner", () => {
  it("is true only for paid_active with ending-soon context", () => {
    const activeOrder = {
      id: 1,
      Name: "Pass",
      total: 100,
      currency: "AUD",
      OrderPaid: true,
      payment_status: "paid",
      checkout_status: "active",
      payment_channel: "stripe",
      startOrderAt: "2026-01-01",
      endOrderAt: "2026-07-30",
      isActive: true,
      isPaused: false,
      cancel_at_period_end: false,
      stripe_subscription_id: null,
      stripe_status: null,
      hosted_invoice_url: null,
      invoice_pdf: null,
      invoice_number: null,
      invoice_due_date: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
      subscriptionTier: null,
    } satisfies AccountBillingOrderDto;

    expect(shouldShowAccountExpiringSoonBanner("paid_active", activeOrder, [], opts)).toBe(true);
    expect(shouldShowAccountExpiringSoonBanner("no_billing", activeOrder, [], opts)).toBe(false);
  });
});

describe("resolveHistoryOrderSeasonPassStatus", () => {
  it("returns paid awaiting start label", () => {
    const status = resolveHistoryOrderSeasonPassStatus(
      baseHistory({
        isPaid: true,
        isActive: false,
        paymentStatus: "paid",
        checkoutStatus: "complete",
        startAt: "2026-08-01",
      }),
      opts,
    );
    expect(status).toBe("Order ready — starting in 5 days.");
  });

  it("returns ending soon label for active paid row", () => {
    const status = resolveHistoryOrderSeasonPassStatus(
      baseHistory({
        isPaid: true,
        isActive: true,
        paymentStatus: "paid",
        checkoutStatus: "active",
        endAt: "2026-07-30",
      }),
      opts,
    );
    expect(status).toBe("Your account will expire in 3 days.");
  });
});

describe("toSeasonPassOrderDisplayFromHistory", () => {
  it("maps isPaid and orderPaid", () => {
    expect(
      toSeasonPassOrderDisplayFromHistory(baseHistory({ isPaid: true, orderPaid: true })).orderPaid,
    ).toBe(true);
  });
});
