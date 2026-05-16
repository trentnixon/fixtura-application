export type AccountSignInSecurityItemKey = "displayName" | "loginEmail" | "password";

export type AccountSignInSecurityItem = {
  actionLabel: string;
  key: AccountSignInSecurityItemKey;
  label: string;
};

export type AccountSignInSecurityRow = AccountSignInSecurityItem & {
  value: string;
  valueTone: "default" | "password";
  withMailIcon?: boolean;
};
