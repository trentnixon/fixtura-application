import type { AccountSignInSecurityItem } from "../_types/account-sign-in-security";

export const ACCOUNT_SIGN_IN_SECURITY_SECTION_TITLE = "Sign-in and security";
export const ACCOUNT_SIGN_IN_SECURITY_SECTION_DESCRIPTION =
  "How you sign in and credentials for this account.";
export const ACCOUNT_SIGN_IN_SECURITY_PASSWORD_MASK = "********";

export const ACCOUNT_SIGN_IN_SECURITY_ITEMS: AccountSignInSecurityItem[] = [
  {
    key: "displayName",
    label: "User name",
    actionLabel: "Change user name",
  },
  {
    key: "loginEmail",
    label: "Login email",
    actionLabel: "Change login email",
  },
  {
    key: "password",
    label: "Password",
    actionLabel: "Change password",
  },
];
