import { describe, expect, it } from "vitest";

import { computePassEndDateYyyyMmDd } from "./passEndDateFromWizardStart";
import { shouldShowStripeImmediateInvoiceCreate } from "./shouldShowStripeImmediateInvoice";

import type { AccountMePayload } from "@/types/api/account";

describe("computePassEndDateYyyyMmDd", () => {
  it("inclusive window: 365-day pass from fixed start yields start + 364 days", () => {
    expect(computePassEndDateYyyyMmDd("2026-01-01", 365)).toBe("2026-12-31");
  });

  it("defaults to single day when daysInPass is zero or invalid", () => {
    expect(computePassEndDateYyyyMmDd("2026-06-01", 0)).toBe("2026-06-01");
    expect(computePassEndDateYyyyMmDd("2026-06-01", -40)).toBe("2026-06-01");
  });

  it("throws on invalid wizard start segment", () => {
    expect(() => computePassEndDateYyyyMmDd("", 10)).toThrow(/Invalid start date/);
    expect(() => computePassEndDateYyyyMmDd("not-a-date", 10)).toThrow(/Invalid start date/);
  });
});

function meWithRole(role: { id: number; name: string; type: string } | null): AccountMePayload {
  return {
    accountId: 1,
    user: {
      id: 1,
      username: "t",
      email: "t@example.com",
      confirmed: true,
      blocked: false,
      role,
    },
  };
}

describe("shouldShowStripeImmediateInvoiceCreate", () => {
  it("returns false for empty actions and authenticated member-ish role names", () => {
    expect(
      shouldShowStripeImmediateInvoiceCreate({
        availableActions: { canStartCheckout: true },
        me: meWithRole({ id: 2, name: "Authenticated", type: "authenticated" }),
      }),
    ).toBe(false);
  });

  it("returns true when CMS sets canCreateStripeInvoice", () => {
    expect(
      shouldShowStripeImmediateInvoiceCreate({
        availableActions: { canCreateStripeInvoice: true },
        me: null,
      }),
    ).toBe(true);
  });

  it("returns true for staff-named roles", () => {
    expect(
      shouldShowStripeImmediateInvoiceCreate({
        availableActions: {},
        me: meWithRole({ id: 9, name: "Fixtura Staff", type: "authenticated" }),
      }),
    ).toBe(true);
  });

  it("returns true when role type is admin", () => {
    expect(
      shouldShowStripeImmediateInvoiceCreate({
        availableActions: {},
        me: meWithRole({ id: 10, name: "Admin", type: "admin" }),
      }),
    ).toBe(true);
  });
});
