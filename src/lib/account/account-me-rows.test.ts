import { describe, expect, it } from "vitest";

import {
  accountPickerRowsFromMePayload,
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
  themeFromAccountMeRow,
} from "./account-me-rows";
import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
  accountThemeSummaryFixture,
} from "./account-summary-fixture";

describe("organisationDetailsFromAccountRow", () => {
  const hubOrg = accountOrganisationSummaryFixture({
    id: 1,
    Name: "From Hub",
    href: "https://example.com/hub",
    ParentLogo: "https://example.com/hub.png",
    Sport: "Cricket",
  });
  const topOrg = accountOrganisationSummaryFixture({
    id: 2,
    Name: "From Top",
    href: "https://example.com/top",
    ParentLogo: "https://example.com/top.png",
    Sport: "Netball",
  });

  it("returns contentHub.accountOrganisationDetails when only legacy hub is set", () => {
    expect(
      organisationDetailsFromAccountRow(
        accountSummaryFixture({
          id: 99,
          contentHub: { accountOrganisationDetails: hubOrg },
        }),
      ),
    ).toEqual(hubOrg);
  });

  it("returns top-level accountOrganisationDetails when hub slice is absent", () => {
    expect(
      organisationDetailsFromAccountRow(
        accountSummaryFixture({
          id: 319,
          accountOrganisationDetails: topOrg,
        }),
      ),
    ).toEqual(topOrg);
  });

  it("prefers contentHub when both are present", () => {
    expect(
      organisationDetailsFromAccountRow(
        accountSummaryFixture({
          id: 1,
          contentHub: { accountOrganisationDetails: hubOrg },
          accountOrganisationDetails: topOrg,
        }),
      ),
    ).toEqual(hubOrg);
  });

  it("returns undefined when neither path is set", () => {
    expect(organisationDetailsFromAccountRow(accountSummaryFixture({ id: 1 }))).toBeUndefined();
  });

  it("returns undefined when accountOrganisationDetails is null", () => {
    expect(
      organisationDetailsFromAccountRow(
        accountSummaryFixture({ id: 1, accountOrganisationDetails: null }),
      ),
    ).toBeUndefined();
  });
});

describe("themeFromAccountMeRow", () => {
  it("returns theme slice from bootstrap row", () => {
    const theme = accountThemeSummaryFixture({
      id: 42,
      name: "North Districts Blue",
      isPublic: false,
      theme: { primary: "#003366", secondary: "#FF6600" },
    });
    expect(themeFromAccountMeRow(accountSummaryFixture({ id: 1, theme }))).toEqual(theme);
  });

  it("returns null when row has no theme", () => {
    expect(themeFromAccountMeRow(accountSummaryFixture({ id: 1, theme: null }))).toBeNull();
  });
});

describe("accountPickerRowsFromMePayload", () => {
  it("returns empty when payload is undefined", () => {
    expect(accountPickerRowsFromMePayload(undefined)).toEqual([]);
  });

  it("returns every accounts[] row (two or more)", () => {
    const rows = accountPickerRowsFromMePayload({
      accountId: 1,
      user: null,
      accounts: [
        accountSummaryFixture({ id: 10, FirstName: "A" }),
        accountSummaryFixture({ id: 20, FirstName: "B" }),
      ],
    });
    expect(rows.map((r) => r.id)).toEqual([10, 20]);
  });

  it("returns empty when accounts is an empty array (no compatibility synth)", () => {
    expect(
      accountPickerRowsFromMePayload({
        accountId: 99,
        user: null,
        contentHub: { FirstName: "A" },
        accounts: [],
      }),
    ).toEqual([]);
  });

  it("tolerates null or absent compatibility accountId", () => {
    expect(
      accountPickerRowsFromMePayload({
        accountId: null,
        user: null,
        accounts: [accountSummaryFixture({ id: 7 })],
      }).map((r) => r.id),
    ).toEqual([7]);
    expect(
      accountPickerRowsFromMePayload({
        user: null,
        accounts: [accountSummaryFixture({ id: 8 }), accountSummaryFixture({ id: 9 })],
      }).map((r) => r.id),
    ).toEqual([8, 9]);
  });
});

describe("activeAccountSummaryFromMePayload", () => {
  it("returns undefined when payload is undefined", () => {
    expect(activeAccountSummaryFromMePayload(undefined, "1")).toBeUndefined();
  });

  it("returns undefined when selectedAccountId is omitted or empty", () => {
    const payload = {
      accountId: 2,
      user: null,
      accounts: [
        accountSummaryFixture({ id: 1, FirstName: "A" }),
        accountSummaryFixture({ id: 2, FirstName: "B" }),
      ],
    };
    expect(activeAccountSummaryFromMePayload(payload, undefined)).toBeUndefined();
    expect(activeAccountSummaryFromMePayload(payload, "")).toBeUndefined();
  });

  it("selects row matching selectedAccountId when provided", () => {
    const payload = {
      accountId: 1,
      user: null,
      accounts: [
        accountSummaryFixture({ id: 1, FirstName: "A" }),
        accountSummaryFixture({ id: 2, FirstName: "B" }),
      ],
    };
    expect(activeAccountSummaryFromMePayload(payload, "2")?.FirstName).toBe("B");
  });

  it("returns undefined when id does not match (no first-row fallback)", () => {
    const payload = {
      accountId: 1,
      user: null,
      accounts: [accountSummaryFixture({ id: 1, FirstName: "Only" })],
    };
    expect(activeAccountSummaryFromMePayload(payload, "999")).toBeUndefined();
  });

  it("does not use compatibility accountId when selected id is omitted", () => {
    const payload = {
      accountId: 2,
      user: null,
      accounts: [
        accountSummaryFixture({ id: 1, FirstName: "A" }),
        accountSummaryFixture({ id: 2, FirstName: "B" }),
      ],
    };
    expect(activeAccountSummaryFromMePayload(payload, undefined)).toBeUndefined();
  });
});
