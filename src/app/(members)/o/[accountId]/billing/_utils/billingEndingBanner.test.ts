import { describe, expect, it } from "vitest";

import {
  billingEndingBannerPeriodEndTrail,
  shouldShowBillingEndingBanner,
} from "./billingEndingBanner";

describe("shouldShowBillingEndingBanner", () => {
  it("returns true only when cancel_at_period_end is true", () => {
    expect(shouldShowBillingEndingBanner({ cancel_at_period_end: true })).toBe(true);
    expect(shouldShowBillingEndingBanner({ cancel_at_period_end: false })).toBe(false);
    expect(shouldShowBillingEndingBanner({ cancel_at_period_end: null })).toBe(false);
  });
});

describe("billingEndingBannerPeriodEndTrail", () => {
  it("returns empty when end is missing or unformattable", () => {
    expect(billingEndingBannerPeriodEndTrail(null)).toBe("");
    expect(billingEndingBannerPeriodEndTrail(undefined)).toBe("");
    expect(billingEndingBannerPeriodEndTrail("")).toBe("");
  });

  it("returns prefixed clause when endOrderAt is a valid date string", () => {
    const trail = billingEndingBannerPeriodEndTrail("2026-06-15T00:00:00.000Z");
    expect(trail.startsWith(" Current period ends around ")).toBe(true);
    expect(trail.endsWith(".")).toBe(true);
  });
});
