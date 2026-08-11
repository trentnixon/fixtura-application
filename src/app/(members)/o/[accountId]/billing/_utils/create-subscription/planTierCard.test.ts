import { describe, expect, it } from "vitest";

import { planTierGridColumnClass } from "./planTierCard";

describe("planTierGridColumnClass", () => {
  it("returns single column for zero or one tier", () => {
    expect(planTierGridColumnClass(0)).toBe("grid-cols-1");
    expect(planTierGridColumnClass(1)).toBe("grid-cols-1");
  });

  it("returns two columns on md for two tiers", () => {
    expect(planTierGridColumnClass(2)).toBe("grid-cols-1 md:grid-cols-2");
  });

  it("returns three columns on md for three tiers", () => {
    expect(planTierGridColumnClass(3)).toBe("grid-cols-1 md:grid-cols-3");
  });

  it("returns two on md and three on lg for four or more tiers", () => {
    expect(planTierGridColumnClass(4)).toBe("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");
    expect(planTierGridColumnClass(6)).toBe("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");
  });
});
