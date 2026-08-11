import { describe, expect, it } from "vitest";

import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
} from "./account-summary-fixture";
import {
  UNFINISHED_ORGANISATION_DISPLAY_NAME,
  organisationDisplayNameFromAccountRow,
} from "./organisation-display-name";

function row(
  over: Parameters<typeof accountSummaryFixture>[0],
): ReturnType<typeof accountSummaryFixture> {
  return accountSummaryFixture(over);
}

describe("organisationDisplayNameFromAccountRow", () => {
  it("prefers usable onboardingOrganisationName over organisation details", () => {
    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 101,
          onboardingOrganisationName: "Working Name",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 1,
            Name: "Details Name",
            href: "",
            ParentLogo: "",
            Sport: "Cricket",
          }),
        }),
      ),
    ).toBe("Working Name");
  });

  it("uses organisation details Name when onboarding name is blank", () => {
    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 202,
          onboardingOrganisationName: "   ",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 2,
            Name: "North Districts",
            href: "",
            ParentLogo: "",
            Sport: "Cricket",
          }),
        }),
      ),
    ).toBe("North Districts");
  });

  it("uses organisation details when onboarding name is null or absent", () => {
    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 101,
          onboardingOrganisationName: null,
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 1,
            Name: "Metro Club",
            href: "",
            ParentLogo: "",
            Sport: "Netball",
          }),
        }),
      ),
    ).toBe("Metro Club");

    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 202,
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 2,
            Name: "Metro Club",
            href: "",
            ParentLogo: "",
            Sport: "Netball",
          }),
        }),
      ),
    ).toBe("Metro Club");
  });

  it("returns Unfinished organisation when neither source is usable", () => {
    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 101,
          onboardingOrganisationName: null,
          accountOrganisationDetails: null,
        }),
      ),
    ).toBe(UNFINISHED_ORGANISATION_DISPLAY_NAME);

    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 202,
          onboardingOrganisationName: "  ",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 2,
            Name: "   ",
            href: "",
            ParentLogo: "",
            Sport: "",
          }),
        }),
      ),
    ).toBe(UNFINISHED_ORGANISATION_DISPLAY_NAME);

    expect(organisationDisplayNameFromAccountRow(row({ id: 101 }))).toBe(
      UNFINISHED_ORGANISATION_DISPLAY_NAME,
    );
  });

  it("reads legacy contentHub organisation details when top-level details are absent", () => {
    expect(
      organisationDisplayNameFromAccountRow(
        row({
          id: 101,
          contentHub: {
            accountOrganisationDetails: accountOrganisationSummaryFixture({
              id: 9,
              Name: "Legacy Hub Org",
              href: "",
              ParentLogo: "",
              Sport: "Rugby",
            }),
          },
        }),
      ),
    ).toBe("Legacy Hub Org");
  });
});
