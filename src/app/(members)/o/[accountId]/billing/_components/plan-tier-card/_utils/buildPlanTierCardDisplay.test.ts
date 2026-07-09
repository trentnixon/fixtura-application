import { describe, expect, it } from "vitest";

import {
  buildPlanTierCardDisplay,
  selectBillingTierPlanButtonLabel,
} from "./buildPlanTierCardDisplay";

import type { AvailableBillingTier } from "@/types/api/account";

function sampleTier(overrides: Partial<AvailableBillingTier> = {}): AvailableBillingTier {
  return {
    id: "tier_1",
    name: "Season Pass",
    description: "Full season coverage",
    category: "Club",
    price: 520,
    currency: "AUD",
    daysInPass: 365,
    priceByWeekInPass: 10,
    includeSponsors: false,
    includedAssetTypes: [],
    isActive: true,
    ...overrides,
  };
}

describe("buildPlanTierCardDisplay", () => {
  it("builds coverage meta line from daysInPass", () => {
    const display = buildPlanTierCardDisplay(sampleTier({ daysInPass: 30 }));
    expect(display.metaLine).toBe("30 Days Covered");
  });

  it("omits meta line when daysInPass is zero", () => {
    const display = buildPlanTierCardDisplay(sampleTier({ daysInPass: 0 }));
    expect(display.metaLine).toBeNull();
  });

  it("omits weekly price when priceByWeekInPass is missing", () => {
    const display = buildPlanTierCardDisplay(sampleTier({ priceByWeekInPass: undefined }));
    expect(display.weekly).toBeNull();
  });

  it("formats total price and weekly price", () => {
    const display = buildPlanTierCardDisplay(sampleTier());
    expect(display.price).toBe("$520.00 (aud)");
    expect(display.weekly).toBe("$10.00/week");
  });
});

describe("selectBillingTierPlanButtonLabel", () => {
  it("replaces trailing pass with plan in button label", () => {
    expect(selectBillingTierPlanButtonLabel("Season Pass")).toBe("Select Season plan");
  });
});
