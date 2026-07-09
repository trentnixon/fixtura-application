import { describe, expect, it } from "vitest";

import {
  formatBillingTrialStartCardDescription,
  formatBillingTrialStartConfirmDescription,
  resolveBillingTrialAccountName,
} from "./billingTrialStart";

describe("billingTrialStart account name copy", () => {
  it("resolves account name from organisation context", () => {
    expect(
      resolveBillingTrialAccountName({
        accountOrganisationDetails: { Name: "Westside Cricket Club" },
      } as never),
    ).toBe("Westside Cricket Club");
  });

  it("uses account name in card description", () => {
    expect(formatBillingTrialStartCardDescription("Westside Cricket Club")).toBe(
      "Start Westside Cricket Club's trial with no upfront payment. Explore automated content, scheduled delivery, and premium workflow tools.",
    );
  });

  it("falls back to organisation copy when account name is missing", () => {
    expect(formatBillingTrialStartCardDescription("")).toContain("Start your organisation's trial");
    expect(formatBillingTrialStartConfirmDescription("")).toContain(
      "Your organisation will get full Fixtura access for 14 days",
    );
  });

  it("uses account name in confirm description", () => {
    expect(formatBillingTrialStartConfirmDescription("Westside Cricket Club")).toBe(
      "Westside Cricket Club will get full Fixtura access for 14 days. You will not be charged today, and no payment details are required to start.",
    );
  });
});
