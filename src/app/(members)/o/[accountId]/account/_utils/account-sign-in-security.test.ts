import { describe, expect, it } from "vitest";

import { buildAccountSignInSecurityRows } from "./account-sign-in-security";
import { ACCOUNT_SIGN_IN_SECURITY_PASSWORD_MASK } from "../_constants/account-sign-in-security";

import type { AccountSecuritySummary } from "../_types/account-security";

const summary: AccountSecuritySummary = {
  organisationTitle: "Test Org",
  loginEmail: "user@example.com",
  sportLabel: "Cricket",
  accountTypeLabel: "Club",
  activeLabel: "Active",
  setupLabel: "Setup complete",
  displayName: "Jane Doe",
};

describe("buildAccountSignInSecurityRows", () => {
  it("builds three sign-in security rows from summary", () => {
    const rows = buildAccountSignInSecurityRows(summary);

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.key)).toEqual(["displayName", "loginEmail", "password"]);
  });

  it("maps display name and login email values", () => {
    const rows = buildAccountSignInSecurityRows(summary);

    expect(rows[0]?.value).toBe("Jane Doe");
    expect(rows[0]?.valueTone).toBe("default");
    expect(rows[1]?.value).toBe("user@example.com");
    expect(rows[1]?.withMailIcon).toBe(true);
  });

  it("masks password with password tone", () => {
    const rows = buildAccountSignInSecurityRows(summary);
    const passwordRow = rows[2];

    expect(passwordRow?.value).toBe(ACCOUNT_SIGN_IN_SECURITY_PASSWORD_MASK);
    expect(passwordRow?.valueTone).toBe("password");
    expect(passwordRow?.withMailIcon).toBe(false);
  });
});
