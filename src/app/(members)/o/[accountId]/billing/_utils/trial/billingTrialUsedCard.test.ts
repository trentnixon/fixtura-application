import { describe, expect, it } from "vitest";

import { formatBillingTrialUsedCardDescription } from "./billingTrialUsedCard";

describe("formatBillingTrialUsedCardDescription", () => {
  it("uses account name when available", () => {
    expect(formatBillingTrialUsedCardDescription("Westside Cricket Club")).toBe(
      "Westside Cricket Club has already used its free trial.",
    );
    expect(formatBillingTrialUsedCardDescription("Darwin And Districts Cricket Competition")).toBe(
      "Darwin And Districts Cricket Competition has already used its free trial.",
    );
  });

  it("falls back to organisation wording when account name is missing", () => {
    expect(formatBillingTrialUsedCardDescription("")).toBe(
      "This organisation has already used its free trial.",
    );
  });
});
