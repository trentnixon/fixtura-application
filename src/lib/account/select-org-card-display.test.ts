import { describe, expect, it } from "vitest";

import { accountSummaryFixture, accountThemeSummaryFixture } from "./account-summary-fixture";
import {
  SELECT_ORG_NEW_ACCOUNT_DAYS,
  isNewSelectOrgAccount,
  selectOrgCardBrandPalette,
} from "./select-org-card-display";

describe("isNewSelectOrgAccount", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");

  it("returns true within the new-account window", () => {
    const createdAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(isNewSelectOrgAccount(createdAt, now)).toBe(true);
  });

  it(`returns true at exactly ${SELECT_ORG_NEW_ACCOUNT_DAYS} days`, () => {
    const createdAt = new Date(
      now.getTime() - SELECT_ORG_NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isNewSelectOrgAccount(createdAt, now)).toBe(true);
  });

  it("returns false when older than the window", () => {
    const createdAt = new Date(
      now.getTime() - (SELECT_ORG_NEW_ACCOUNT_DAYS + 1) * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isNewSelectOrgAccount(createdAt, now)).toBe(false);
  });

  it("returns false for invalid timestamps", () => {
    expect(isNewSelectOrgAccount("not-a-date", now)).toBe(false);
  });
});

describe("selectOrgCardBrandPalette", () => {
  it("returns primary and secondary from me-row theme", () => {
    const row = accountSummaryFixture({
      id: 1,
      theme: accountThemeSummaryFixture({
        id: 2,
        theme: { primary: "#003366", secondary: "#FF6600" },
      }),
    });
    expect(selectOrgCardBrandPalette(row)).toEqual({
      primary: "#003366",
      secondary: "#FF6600",
    });
  });

  it("returns palette when a logo is also present", () => {
    const row = accountSummaryFixture({
      id: 1,
      accountOrganisationDetails: {
        id: 9,
        Name: "Club",
        href: null,
        ParentLogo: "https://example.com/logo.png",
        Sport: "Cricket",
      },
      theme: accountThemeSummaryFixture({
        id: 2,
        theme: { primary: "#003366", secondary: "#FF6600" },
      }),
    });
    expect(selectOrgCardBrandPalette(row)?.primary).toBe("#003366");
  });

  it("returns undefined when row has no theme", () => {
    expect(
      selectOrgCardBrandPalette(accountSummaryFixture({ id: 1, theme: null })),
    ).toBeUndefined();
  });
});
