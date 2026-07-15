import { describe, expect, it } from "vitest";

import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
} from "@/lib/account/account-summary-fixture";

import { getBillingInvoicePrefillValues } from "./billingInvoiceRequestPrefill";

import type { AccountMePayload, AccountOrganisationContextData } from "@/types/api/account";

describe("getBillingInvoicePrefillValues", () => {
  it("uses user email, first/last name, and org context name", () => {
    const me: AccountMePayload = {
      accountId: 42,
      user: {
        id: 1,
        username: "u1",
        email: "member@example.com",
        confirmed: true,
        blocked: false,
        role: null,
      },
      accounts: [
        accountSummaryFixture({
          id: 42,
          FirstName: "Jane",
          LastName: "Doe",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 1,
            Name: "Row Org",
            href: "",
            ParentLogo: "",
            Sport: "",
          }),
        }),
      ],
    };
    const org: AccountOrganisationContextData = {
      id: 42,
      account_type: null,
      accountOrganisationDetails: {
        id: 1,
        Name: "Context Club Name",
        href: "/x",
        ParentLogo: "",
        Sport: "Netball",
      },
    };
    const p = getBillingInvoicePrefillValues("42", me, org);
    expect(p).toEqual({
      billingContactName: "Jane Doe",
      billingEmail: "member@example.com",
      billingOrganisationName: "Context Club Name",
    });
  });

  it("falls back to me row org name when context missing", () => {
    const me: AccountMePayload = {
      accountId: 7,
      user: {
        id: 1,
        username: "solo",
        email: "a@b.co",
        confirmed: true,
        blocked: false,
        role: null,
      },
      accounts: [
        accountSummaryFixture({
          id: 7,
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 2,
            Name: "Fallback Org",
            href: "",
            ParentLogo: "",
            Sport: "",
          }),
        }),
      ],
    };
    const p = getBillingInvoicePrefillValues("7", me, undefined);
    expect(p.billingOrganisationName).toBe("Fallback Org");
    expect(p.billingEmail).toBe("a@b.co");
  });

  it("resolves org/contact by explicit account id — never the other owned row", () => {
    const me: AccountMePayload = {
      accountId: 123,
      user: {
        id: 1,
        username: "multi",
        email: "shared@example.com",
        confirmed: true,
        blocked: false,
        role: null,
      },
      accounts: [
        accountSummaryFixture({
          id: 123,
          FirstName: "Alice",
          LastName: "A",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 1,
            Name: "Org A",
            href: "",
            ParentLogo: "",
            Sport: "",
          }),
        }),
        accountSummaryFixture({
          id: 456,
          FirstName: "Bob",
          LastName: "B",
          accountOrganisationDetails: accountOrganisationSummaryFixture({
            id: 2,
            Name: "Org B",
            href: "",
            ParentLogo: "",
            Sport: "",
          }),
        }),
      ],
    };

    expect(getBillingInvoicePrefillValues("456", me, undefined)).toEqual({
      billingContactName: "Bob B",
      billingEmail: "shared@example.com",
      billingOrganisationName: "Org B",
    });
    expect(getBillingInvoicePrefillValues("123", me, undefined)).toEqual({
      billingContactName: "Alice A",
      billingEmail: "shared@example.com",
      billingOrganisationName: "Org A",
    });
  });
});
