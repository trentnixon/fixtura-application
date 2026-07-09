import { describe, expect, it } from "vitest";

import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { buildAccountSecuritySummary, formatAccountDisplayName } from "./account-security-display";
import { ACCOUNT_EMPTY_VALUE_LABEL } from "../_constants/account-display-primitives";

import type { AccountOrganisationContextData, AccountSettingsData } from "@/types/api/account";

function baseSettings(overrides: Partial<AccountSettingsData> = {}): AccountSettingsData {
  return {
    id: 1,
    FirstName: null,
    LastName: null,
    DeliveryAddress: null,
    isActive: true,
    isSetup: true,
    isUpdating: false,
    isRightsHolder: null,
    isPermissionGiven: null,
    group_assets_by: false,
    include_junior_surnames: false,
    Sport: "",
    hasCompletedStartSequence: true,
    hasCustomTemplate: false,
    account_type: null,
    ...overrides,
  };
}

function baseOrgContext(
  overrides: Partial<AccountOrganisationContextData> = {},
): AccountOrganisationContextData {
  return {
    id: 1,
    account_type: null,
    accountOrganisationDetails: {
      id: 1,
      Name: "Context Org",
      href: "",
      ParentLogo: "",
      Sport: "Cricket",
    },
    ...overrides,
  };
}

describe("formatAccountDisplayName", () => {
  it("returns first and last name when both are set", () => {
    expect(formatAccountDisplayName(baseSettings({ FirstName: "Ada", LastName: "Lovelace" }))).toBe(
      "Ada Lovelace",
    );
  });

  it("returns first name only when last name is empty", () => {
    expect(formatAccountDisplayName(baseSettings({ FirstName: "Ada", LastName: "" }))).toBe("Ada");
  });

  it("returns last name only when first name is empty", () => {
    expect(formatAccountDisplayName(baseSettings({ FirstName: "", LastName: "Lovelace" }))).toBe(
      "Lovelace",
    );
  });

  it("returns empty label when no names are set", () => {
    expect(formatAccountDisplayName(baseSettings())).toBe(ACCOUNT_EMPTY_VALUE_LABEL);
  });
});

describe("buildAccountSecuritySummary", () => {
  it("prefers organisation context name over onboarding name", () => {
    const summary = buildAccountSecuritySummary(
      baseSettings({ onboardingOrganisationName: "Onboarding Org" }),
      baseOrgContext(),
      "user@example.com",
    );

    expect(summary.organisationTitle).toBe("Context Org");
    expect(summary.sportLabel).toBe("Cricket");
    expect(summary.loginEmail).toBe("user@example.com");
  });

  it("falls back to onboarding organisation name when context is missing", () => {
    const summary = buildAccountSecuritySummary(
      baseSettings({ onboardingOrganisationName: "Onboarding Org", Sport: "Netball" }),
      undefined,
      undefined,
    );

    expect(summary.organisationTitle).toBe("Onboarding Org");
    expect(summary.sportLabel).toBe("Netball");
    expect(summary.loginEmail).toBe(ACCOUNT_EMPTY_VALUE_LABEL);
  });

  it("uses em dash when org title and sport are unavailable", () => {
    const summary = buildAccountSecuritySummary(baseSettings(), undefined, undefined);

    expect(summary.organisationTitle).toBe(ACCOUNT_EMPTY_VALUE_LABEL);
    expect(summary.sportLabel).toBe(ACCOUNT_EMPTY_VALUE_LABEL);
  });

  it("labels club and association account types", () => {
    const clubSummary = buildAccountSecuritySummary(
      baseSettings({ account_type: CLUB_ACCOUNT_TYPE_ID }),
      undefined,
      undefined,
    );
    const associationSummary = buildAccountSecuritySummary(
      baseSettings({ account_type: 2 }),
      undefined,
      undefined,
    );

    expect(clubSummary.accountTypeLabel).toBe("Club");
    expect(associationSummary.accountTypeLabel).toBe("Association");
  });

  it("reflects active and setup status labels", () => {
    const summary = buildAccountSecuritySummary(
      baseSettings({ isActive: false, isSetup: false }),
      undefined,
      undefined,
    );

    expect(summary.activeLabel).toBe("Inactive");
    expect(summary.setupLabel).toBe("Setup pending");
  });

  it("includes display name from settings", () => {
    const summary = buildAccountSecuritySummary(
      baseSettings({ FirstName: "Jane", LastName: "Doe" }),
      undefined,
      "jane@example.com",
    );

    expect(summary.displayName).toBe("Jane Doe");
  });
});
