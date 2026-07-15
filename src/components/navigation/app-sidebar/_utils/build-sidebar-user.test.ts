import { describe, expect, it } from "vitest";

import {
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";
import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
} from "@/lib/account/account-summary-fixture";

import { buildAppSidebarUser } from "./build-sidebar-user";

import type { AccountMePayload } from "@/types/api/account";

function orgDetails(id: number, name: string) {
  return accountOrganisationSummaryFixture({
    id,
    Name: name,
    href: "",
    ParentLogo: `/logos/${id}.png`,
    Sport: "Cricket",
  });
}

function twoAccountPayload(): AccountMePayload {
  const accounts = [
    accountSummaryFixture({
      id: 101,
      FirstName: "Alpha",
      accountOrganisationDetails: orgDetails(101, "Alpha Org"),
    }),
    accountSummaryFixture({
      id: 202,
      FirstName: "Beta",
      accountOrganisationDetails: orgDetails(202, "Beta Org"),
    }),
  ];
  return {
    accountId: 101,
    user: {
      id: 9,
      username: "member",
      email: "member@example.com",
      confirmed: true,
      blocked: false,
      role: null,
    },
    accounts,
  };
}

describe("buildAppSidebarUser", () => {
  it("gateway mode ignores bootstrap org rows even when they are supplied", () => {
    const payload = twoAccountPayload();
    const bootstrapRow = activeAccountSummaryFromMePayload(payload, "101");
    const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

    const user = buildAppSidebarUser({
      navMode: "gateway",
      bootstrapRow,
      bootstrapOrg,
      sessionEmail: payload.user?.email,
      orgContextData: undefined,
    });

    expect(user.name).toBe("Member");
    expect(user.email).toBe("member@example.com");
    expect(user.avatar).toBe("/avatars/shadcn.jpg");
    expect(user.email).not.toBe("Alpha Org");
    expect(user.email).not.toBe("Beta Org");
  });

  it("gateway mode does not fall back to accounts[0] or compatibility accountId", () => {
    const payload = twoAccountPayload();
    const user = buildAppSidebarUser({
      navMode: "gateway",
      bootstrapRow: payload.accounts?.[0],
      bootstrapOrg: organisationDetailsFromAccountRow(payload.accounts![0]!),
      sessionEmail: "session@example.com",
      orgContextData: {
        id: 101,
        account_type: 1,
        accountOrganisationDetails: orgDetails(101, "Should Not Show"),
      },
    });

    expect(user.email).toBe("session@example.com");
    expect(user.name).toBe("Member");
  });

  it("scoped mode uses only the matching route account id from bootstrap", () => {
    const payload = twoAccountPayload();
    const bootstrapRow = activeAccountSummaryFromMePayload(payload, "202");
    const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

    expect(bootstrapRow?.id).toBe(202);

    const user = buildAppSidebarUser({
      navMode: "scoped",
      bootstrapRow,
      bootstrapOrg,
      sessionEmail: payload.user?.email,
      orgContextData: undefined,
    });

    expect(user.name).toBe("Beta");
    expect(user.email).toBe("Beta Org");
    expect(user.avatar).toBe("/logos/202.png");
  });

  it("scoped mode prefers organisation context for the route account", () => {
    const payload = twoAccountPayload();
    const bootstrapRow = activeAccountSummaryFromMePayload(payload, "101");
    const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

    const user = buildAppSidebarUser({
      navMode: "scoped",
      bootstrapRow,
      bootstrapOrg,
      sessionEmail: payload.user?.email,
      orgContextData: {
        id: 101,
        account_type: 1,
        accountOrganisationDetails: orgDetails(101, "Context Org Name"),
      },
    });

    expect(user.email).toBe("Context Org Name");
  });

  it("scoped mode with unmatched account id does not invent a default org", () => {
    const payload = twoAccountPayload();
    const bootstrapRow = activeAccountSummaryFromMePayload(payload, "999");

    expect(bootstrapRow).toBeUndefined();

    const user = buildAppSidebarUser({
      navMode: "scoped",
      bootstrapRow,
      bootstrapOrg: undefined,
      sessionEmail: "session@example.com",
      orgContextData: undefined,
    });

    expect(user.name).toBe("Member");
    expect(user.email).toBe("session@example.com");
  });
});
