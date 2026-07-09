import { describe, expect, it } from "vitest";

import { formatBillingCreateSeasonPassDescription } from "./billingCreateSeasonPassCard";

describe("formatBillingCreateSeasonPassDescription", () => {
  it("uses account name when available", () => {
    expect(formatBillingCreateSeasonPassDescription("Westside Cricket Club")).toBe(
      "Set up a Season Pass to keep Fixtura active for Westside Cricket Club.",
    );
  });

  it("falls back to organisation wording when account name is missing", () => {
    expect(formatBillingCreateSeasonPassDescription("")).toBe(
      "Set up a Season Pass to keep Fixtura active for this organisation.",
    );
  });
});
