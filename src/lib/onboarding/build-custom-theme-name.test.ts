import { describe, expect, it } from "vitest";

import {
  ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH,
  buildOnboardingCustomThemeName,
} from "./build-custom-theme-name";

import type { AccountMeUser, AccountSummary } from "@/types/api/account";

const user: AccountMeUser = {
  id: 1,
  username: "jdoe",
  email: "jane@example.com",
  confirmed: true,
  blocked: false,
  role: null,
};

describe("buildOnboardingCustomThemeName", () => {
  it("joins first/last name and onboarding org with em dash", () => {
    const row: AccountSummary = {
      id: 10,
      FirstName: "Jane",
      LastName: "Doe",
      onboardingOrganisationName: "Westside Cricket Club",
    };
    expect(buildOnboardingCustomThemeName({ user, accountRow: row })).toEqual({
      name: "Jane Doe — Westside Cricket Club",
      isComplete: true,
    });
  });

  it("falls back to username when names are missing", () => {
    const row: AccountSummary = {
      id: 10,
      onboardingOrganisationName: "Westside Cricket Club",
    };
    expect(buildOnboardingCustomThemeName({ user, accountRow: row })).toEqual({
      name: "jdoe — Westside Cricket Club",
      isComplete: true,
    });
  });

  it("uses organisation Name when onboardingOrganisationName is absent", () => {
    const row: AccountSummary = {
      id: 10,
      FirstName: "A",
      accountOrganisationDetails: {
        id: 1,
        Name: "Assoc Name",
        href: "",
        ParentLogo: "",
        Sport: "Cricket",
      },
    };
    expect(buildOnboardingCustomThemeName({ user, accountRow: row }).name).toBe("A — Assoc Name");
  });

  it("returns incomplete when org part is missing", () => {
    const row: AccountSummary = { id: 10, FirstName: "Jane" };
    expect(buildOnboardingCustomThemeName({ user, accountRow: row })).toEqual({
      name: "",
      isComplete: false,
    });
  });

  it("truncates to max length", () => {
    const long = "x".repeat(ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH + 10);
    const row: AccountSummary = {
      id: 10,
      FirstName: long,
      onboardingOrganisationName: "Org",
    };
    const { name } = buildOnboardingCustomThemeName({ user, accountRow: row });
    expect(name.length).toBe(ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH);
  });
});
