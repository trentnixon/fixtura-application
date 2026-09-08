import { describe, expect, it } from "vitest";

import {
  buildOrganizationGroupProperties,
  deriveAnalyticsPlanFromBilling,
  pickOrganizationGroupProperties,
} from "./organization-group-properties";

import type { AccountBillingSummaryV1, AccountSummary } from "@/types/api/account";

describe("pickOrganizationGroupProperties", () => {
  it("keeps allowlisted keys only", () => {
    expect(
      pickOrganizationGroupProperties({
        name: "Eastside CC",
        plan: "trial",
        sport: "cricket",
        email: "secret@example.com",
        accountId: "12",
      }),
    ).toEqual({
      name: "Eastside CC",
      plan: "trial",
      sport: "cricket",
    });
  });

  it("drops empty string values", () => {
    expect(pickOrganizationGroupProperties({ name: "  ", plan: "active" })).toEqual({
      plan: "active",
    });
  });
});

describe("deriveAnalyticsPlanFromBilling", () => {
  it("returns trial when trial is active", () => {
    const summary: AccountBillingSummaryV1 = {
      billingStatus: "active",
      accessStatus: "active",
      currentPlan: null,
      trial: { isActive: true },
      activeOrder: null,
      latestInvoiceRequest: null,
    };
    expect(deriveAnalyticsPlanFromBilling(summary)).toBe("trial");
  });

  it("returns tier id when current plan exists", () => {
    const summary: AccountBillingSummaryV1 = {
      billingStatus: "active",
      accessStatus: "active",
      currentPlan: {
        id: "tier-club-pro",
        name: "Club Pro",
        description: "",
        category: "Club",
        price: 100,
        currency: "AUD",
        daysInPass: 30,
        isActive: true,
        includeSponsors: false,
        includedAssetTypes: [],
        orderId: null,
        paymentChannel: null,
      },
      trial: null,
      activeOrder: null,
      latestInvoiceRequest: null,
    };
    expect(deriveAnalyticsPlanFromBilling(summary)).toBe("tier-club-pro");
  });

  it("falls back to billingStatus", () => {
    const summary: AccountBillingSummaryV1 = {
      billingStatus: "trial_available",
      accessStatus: "none",
      currentPlan: null,
      trial: null,
      activeOrder: null,
      latestInvoiceRequest: null,
    };
    expect(deriveAnalyticsPlanFromBilling(summary)).toBe("trial_available");
  });
});

describe("buildOrganizationGroupProperties", () => {
  it("maps account row and billing into group properties", () => {
    const account = {
      id: 575,
      Sport: "Cricket",
      onboardingOrganisationName: "Eastside CC",
    } as AccountSummary;

    const billing: AccountBillingSummaryV1 = {
      billingStatus: "active",
      accessStatus: "active",
      currentPlan: null,
      trial: { isActive: true },
      activeOrder: null,
      latestInvoiceRequest: null,
    };

    expect(buildOrganizationGroupProperties(account, billing)).toEqual({
      name: "Eastside CC",
      plan: "trial",
      sport: "Cricket",
    });
  });
});
