import { describe, expect, it } from "vitest";

import {
  accountPickerRowsFromMePayload,
  organisationDetailsFromAccountRow,
} from "./account-me-rows";

describe("organisationDetailsFromAccountRow", () => {
  const hubOrg = {
    id: 1,
    Name: "From Hub",
    href: "https://example.com/hub",
    ParentLogo: "https://example.com/hub.png",
    Sport: "Cricket",
  };
  const topOrg = {
    id: 2,
    Name: "From Top",
    href: "https://example.com/top",
    ParentLogo: "https://example.com/top.png",
    Sport: "Netball",
  };

  it("returns contentHub.accountOrganisationDetails when only legacy hub is set", () => {
    expect(
      organisationDetailsFromAccountRow({
        id: 99,
        contentHub: { accountOrganisationDetails: hubOrg },
      }),
    ).toEqual(hubOrg);
  });

  it("returns top-level accountOrganisationDetails when hub slice is absent", () => {
    expect(
      organisationDetailsFromAccountRow({
        id: 319,
        accountOrganisationDetails: topOrg,
      }),
    ).toEqual(topOrg);
  });

  it("prefers contentHub when both are present", () => {
    expect(
      organisationDetailsFromAccountRow({
        id: 1,
        contentHub: { accountOrganisationDetails: hubOrg },
        accountOrganisationDetails: topOrg,
      }),
    ).toEqual(hubOrg);
  });

  it("returns undefined when neither path is set", () => {
    expect(organisationDetailsFromAccountRow({ id: 1 })).toBeUndefined();
  });
});

describe("accountPickerRowsFromMePayload", () => {
  it("returns empty when payload is undefined", () => {
    expect(accountPickerRowsFromMePayload(undefined)).toEqual([]);
  });

  it("prefers accounts[] when present", () => {
    const rows = accountPickerRowsFromMePayload({
      accountId: 1,
      user: null,
      contentHub: {},
      accounts: [
        { id: 2, contentHub: {} },
        { id: 3, contentHub: {} },
      ],
    });
    expect(rows.map((r) => r.id)).toEqual([2, 3]);
  });

  it("falls back to legacy accountId when accounts is empty", () => {
    const rows = accountPickerRowsFromMePayload({
      accountId: 99,
      user: null,
      contentHub: { FirstName: "A" },
      accounts: [],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(99);
    expect(rows[0]?.contentHub).toEqual({ FirstName: "A" });
  });
});
