import { Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AccountSectionShell } from "./AccountSectionShell";
import {
  ACCOUNT_SIGN_IN_SECURITY_SECTION_DESCRIPTION,
  ACCOUNT_SIGN_IN_SECURITY_SECTION_TITLE,
} from "../_constants/account-sign-in-security";
import { buildAccountSignInSecurityRows } from "../_utils/account-sign-in-security";

import type { AccountSecuritySummary } from "../_types/account-security";
import type { AccountSignInSecurityItemKey } from "../_types/account-sign-in-security";

type AccountSignInSecuritySectionProps = {
  summary: AccountSecuritySummary;
  onEditDisplayName: () => void;
  onEditEmail: () => void;
  onEditPassword: () => void;
};

export function AccountSignInSecuritySection({
  summary,
  onEditDisplayName,
  onEditEmail,
  onEditPassword,
}: AccountSignInSecuritySectionProps) {
  const actionHandlers: Record<AccountSignInSecurityItemKey, () => void> = {
    displayName: onEditDisplayName,
    loginEmail: onEditEmail,
    password: onEditPassword,
  };
  const rows = buildAccountSignInSecurityRows(summary);

  return (
    <AccountSectionShell
      title={ACCOUNT_SIGN_IN_SECURITY_SECTION_TITLE}
      description={ACCOUNT_SIGN_IN_SECURITY_SECTION_DESCRIPTION}
      icon={<ShieldCheck className="size-5" aria-hidden />}
      headerTone="brand"
    >
      <div className="px-0 pb-0">
        <ul className="border-border divide-border divide-y border-t">
          {rows.map((row) => (
            <li
              key={row.key}
              className="border-border flex flex-col gap-3 border-b px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{row.label}</div>
                {row.withMailIcon ? (
                  <div className="text-foreground flex min-w-0 items-center gap-2 truncate text-sm">
                    <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    <span className="truncate">{row.value}</span>
                  </div>
                ) : (
                  <div
                    className={
                      row.valueTone === "password"
                        ? "text-foreground text-sm tracking-widest tabular-nums"
                        : "text-foreground truncate text-sm"
                    }
                  >
                    {row.value}
                  </div>
                )}
              </div>
              <form
                className="shrink-0"
                onSubmit={(event) => {
                  event.preventDefault();
                  actionHandlers[row.key]();
                }}
              >
                <Button type="submit" variant="outline" className="rounded-xl">
                  {row.actionLabel}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </AccountSectionShell>
  );
}
