import {
  ACCOUNT_SIGN_IN_SECURITY_ITEMS,
  ACCOUNT_SIGN_IN_SECURITY_PASSWORD_MASK,
} from "../_constants/account-sign-in-security";

import type { AccountSecuritySummary } from "../_types/account-security";
import type {
  AccountSignInSecurityItemKey,
  AccountSignInSecurityRow,
} from "../_types/account-sign-in-security";

export function buildAccountSignInSecurityRows(
  summary: AccountSecuritySummary,
): AccountSignInSecurityRow[] {
  return ACCOUNT_SIGN_IN_SECURITY_ITEMS.map((item) => ({
    ...item,
    value: resolveAccountSignInSecurityValue(item.key, summary),
    valueTone: item.key === "password" ? "password" : "default",
    withMailIcon: item.key === "loginEmail",
  }));
}

function resolveAccountSignInSecurityValue(
  key: AccountSignInSecurityItemKey,
  summary: AccountSecuritySummary,
): string {
  switch (key) {
    case "displayName":
      return summary.displayName;
    case "loginEmail":
      return summary.loginEmail;
    case "password":
      return ACCOUNT_SIGN_IN_SECURITY_PASSWORD_MASK;
  }
}
