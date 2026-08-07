import { describe, expect, it } from "vitest";

import {
  canAccessAllAccountsFromMePayload,
  isOwnedAccountId,
  isSupportOnlyUser,
  isSupportViewForAccount,
  ownedAccountIdsFromMePayload,
} from "./support-capability";

import type { AccountMePayload } from "@/types/api/account";

function mePayload(overrides: Partial<AccountMePayload> = {}): AccountMePayload {
  return {
    user: {
      id: 1,
      username: "user@example.com",
      email: "user@example.com",
      confirmed: true,
      blocked: false,
      role: { id: 1, name: "Authenticated", type: "authenticated" },
      capabilities: { canAccessAllAccounts: false },
    },
    accounts: [{ id: 42 } as AccountMePayload["accounts"][number]],
    ...overrides,
  };
}

describe("support-capability", () => {
  it("detects canAccessAllAccounts from capabilities", () => {
    expect(
      canAccessAllAccountsFromMePayload(
        mePayload({
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
      ),
    ).toBe(true);
    expect(canAccessAllAccountsFromMePayload(mePayload())).toBe(false);
  });

  it("lists owned account ids", () => {
    expect(ownedAccountIdsFromMePayload(mePayload())).toEqual(["42"]);
    expect(ownedAccountIdsFromMePayload(mePayload({ accounts: [] }))).toEqual([]);
  });

  it("isOwnedAccountId matches accounts[] only", () => {
    expect(isOwnedAccountId(mePayload(), "42")).toBe(true);
    expect(isOwnedAccountId(mePayload(), "99")).toBe(false);
    expect(isOwnedAccountId(mePayload(), undefined)).toBe(false);
  });

  it("isSupportOnlyUser when capability and no owned accounts", () => {
    expect(
      isSupportOnlyUser(
        mePayload({
          accounts: [],
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
      ),
    ).toBe(true);
    expect(
      isSupportOnlyUser(
        mePayload({
          user: {
            ...mePayload().user!,
            capabilities: { canAccessAllAccounts: true },
          },
        }),
      ),
    ).toBe(false);
  });

  it("isSupportViewForAccount when capability and non-owned route id", () => {
    const supportPayload = mePayload({
      accounts: [],
      user: {
        ...mePayload().user!,
        capabilities: { canAccessAllAccounts: true },
      },
    });
    expect(isSupportViewForAccount(supportPayload, "575")).toBe(true);
    expect(isSupportViewForAccount(mePayload(), "42")).toBe(false);
    expect(isSupportViewForAccount(supportPayload, "42")).toBe(true);
  });
});
