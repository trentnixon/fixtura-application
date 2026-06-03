import { describe, expect, it } from "vitest";

import { daysUntilNextDelivery } from "./bundle-delivery-weekdays";

describe("daysUntilNextDelivery", () => {
  it("returns 0 when delivery day is today", () => {
    const monday = new Date(2026, 5, 1);
    expect(monday.getDay()).toBe(1);
    expect(daysUntilNextDelivery("monday", monday)).toBe(0);
  });

  it("returns 1 when delivery day is tomorrow", () => {
    const monday = new Date(2026, 5, 1);
    expect(daysUntilNextDelivery("tuesday", monday)).toBe(1);
  });

  it("returns 6 from Monday to Sunday", () => {
    const monday = new Date(2026, 5, 1);
    expect(daysUntilNextDelivery("sunday", monday)).toBe(6);
  });
});
