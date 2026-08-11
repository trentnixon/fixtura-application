import { ShieldCheck } from "lucide-react";

import { TypographyMuted } from "@/components/typography";

import { AccountDefinitionRow } from "./AccountDefinitionRow";
import { AccountSectionShell } from "./AccountSectionShell";
import { AccountSetupBanner } from "./AccountSetupBanner";
import { AccountYesNoBadge } from "./AccountYesNoBadge";
import {
  ACCOUNT_OVERVIEW_ACCESS_ITEMS,
  ACCOUNT_OVERVIEW_SECTION_DESCRIPTION,
  ACCOUNT_OVERVIEW_SECTION_TITLE,
} from "../_constants/account-overview";

import type { AccountOverviewSectionProps } from "../_types/account-overview";

export function AccountOverviewSection({ settings, summary }: AccountOverviewSectionProps) {
  return (
    <AccountSectionShell
      title={ACCOUNT_OVERVIEW_SECTION_TITLE}
      description={ACCOUNT_OVERVIEW_SECTION_DESCRIPTION}
      icon={<ShieldCheck className="size-5" aria-hidden />}
      headerTone="slate"
    >
      <div className="px-0 pb-0">
        <div className="border-border space-y-4 border-b px-6 py-5">
          <div>
            <p className="text-sm font-medium">Organisation</p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {summary.organisationTitle}
            </p>
          </div>
          {!settings.isSetup ? <AccountSetupBanner /> : null}
          {/* Member since / last updated omitted: not on typed AccountSettings/me payloads today. */}
          <dl className="border-border divide-border divide-y border-t">
            <AccountDefinitionRow label="Sport" value={summary.sportLabel} />
            <AccountDefinitionRow label="Account type" value={summary.accountTypeLabel} />
          </dl>
        </div>
        <ul>
          {ACCOUNT_OVERVIEW_ACCESS_ITEMS.map((item) => (
            <li
              key={item.label}
              className="border-border flex items-center justify-between gap-4 border-b px-6 py-4 last:border-b-0"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{item.label}</div>
                <TypographyMuted className="text-xs">{item.description}</TypographyMuted>
              </div>
              <AccountYesNoBadge value={settings[item.settingKey]} />
            </li>
          ))}
        </ul>
      </div>
    </AccountSectionShell>
  );
}
