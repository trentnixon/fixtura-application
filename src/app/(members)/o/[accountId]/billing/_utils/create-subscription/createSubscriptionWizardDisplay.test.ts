import { describe, expect, it } from "vitest";

import {
  buildCreateSubscriptionReviewDisplay,
  buildSelectedDateWindowDisplay,
  formatPassWindowHint,
} from "../../create/_utils/createSubscriptionWizardDisplay";

import type { AvailableBillingTier } from "@/types/api/account";

function tier(overrides: Partial<AvailableBillingTier> = {}): AvailableBillingTier {
  return {
    id: "tier_1",
    name: "Season Pass",
    description: "Season coverage",
    category: "Club",
    price: 520,
    currency: "AUD",
    daysInPass: 365,
    priceByWeekInPass: 10,
    includeSponsors: false,
    includedAssetTypes: [],
    packageName: "Season",
    stripePriceId: "",
    isActive: true,
    ...overrides,
  };
}

describe("buildCreateSubscriptionReviewDisplay", () => {
  it("shows tier name, pass duration, and card payment copy", () => {
    expect(
      buildCreateSubscriptionReviewDisplay({
        selectedTier: tier(),
        selectedTierId: "tier_1",
        paymentPath: "card",
      }),
    ).toEqual({
      selectedTierName: "Season Pass",
      selectedTierCoverage: "365 days in pass",
      paymentMethodLabel: "Card via Stripe Checkout",
      paymentMethodDescription: "You will be redirected to Stripe to pay securely by card.",
    });
  });

  it("falls back when duration metadata is absent", () => {
    expect(
      buildCreateSubscriptionReviewDisplay({
        selectedTier: tier({ daysInPass: 0 }),
        selectedTierId: "tier_1",
        paymentPath: "invoice",
      }),
    ).toMatchObject({
      selectedTierCoverage: "Duration set by selected pass",
      paymentMethodLabel: "Online invoice request",
    });
  });

  it("falls back to selected tier id when the tier row is not resolved", () => {
    expect(
      buildCreateSubscriptionReviewDisplay({
        selectedTier: undefined,
        selectedTierId: "tier_missing",
        paymentPath: null,
      }).selectedTierName,
    ).toBe("tier_missing");
  });
});

describe("buildSelectedDateWindowDisplay", () => {
  it("builds an inclusive start/end window from selected date and tier days", () => {
    expect(
      buildSelectedDateWindowDisplay({
        selectedDate: new Date("2026-05-27T12:00:00"),
        daysInPass: 30,
      }),
    ).toEqual({
      daysInTierLabel: "30 days",
      startDateLabel: "May 27th, 2026",
      endDateLabel: "June 25th, 2026",
    });
  });

  it("returns null until a date is selected", () => {
    expect(
      buildSelectedDateWindowDisplay({
        selectedDate: undefined,
        daysInPass: 30,
      }),
    ).toBeNull();
  });
});

describe("formatPassWindowHint", () => {
  it("formats tier length as a muted pass window hint", () => {
    expect(formatPassWindowHint(365)).toBe("365-day pass window");
  });

  it("returns null when tier days are missing", () => {
    expect(formatPassWindowHint(undefined)).toBeNull();
    expect(formatPassWindowHint(0)).toBeNull();
  });
});
