import { describe, expect, it } from "vitest";

import { formatBillingTrialUsedCardDescription } from "./billingTrialUsedCard";

describe("formatBillingTrialUsedCardDescription", () => {
  it("uses account name when available", () => {
    expect(formatBillingTrialUsedCardDescription("Westside Cricket Club")).toBe(
      "The free trial for Westside Cricket Club has already been used.",
    );
  });

  it("falls back to organisation wording when account name is missing", () => {
    expect(formatBillingTrialUsedCardDescription("")).toBe(
      "The free trial for this organisation has already been used.",
    );
  });
});
