import { describe, expect, it } from "vitest";

import { ROUTES } from "@/lib/config/routes";

import { resolvePostLoginDestination } from "./resolve-post-login-destination";

import type { AccountMePayload } from "@/types/api/account";

function mePayload(overrides: Partial<AccountMePayload> = {}): AccountMePayload {
  return {
    user: {
      id: 1,
      username: "user@example.com",
      email: "user@example.com",
      confirmed: true,
      blocked: false,
      role: { id: 1 },
      capabilities: { canAccessAllAccounts: false },
    },
    accounts: [],
    ...overrides,
  };
}

describe("resolvePostLoginDestination", () => {
  it("prefers safe from deep link", () => {
    expect(
      resolvePostLoginDestination({
        mePayload: mePayload({
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
        fromParam: "/o/575/dashboard",
      }),
    ).toBe("/o/575/dashboard");
  });

  it("sends support-only users to support directory", () => {
    expect(
      resolvePostLoginDestination({
        mePayload: mePayload({
          accounts: [],
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
        fromParam: null,
      }),
    ).toBe(ROUTES.supportAccounts);
  });

  it("sends dual-role support users to select organisation", () => {
    expect(
      resolvePostLoginDestination({
        mePayload: mePayload({
          accounts: [{ id: 10 } as AccountMePayload["accounts"][number]],
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
        fromParam: null,
      }),
    ).toBe(ROUTES.selectOrganisation);
  });

  it("sends normal members to select organisation", () => {
    expect(
      resolvePostLoginDestination({
        mePayload: mePayload({
          accounts: [{ id: 10 } as AccountMePayload["accounts"][number]],
        }),
        fromParam: null,
      }),
    ).toBe(ROUTES.selectOrganisation);
  });
});
