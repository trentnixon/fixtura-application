import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { ACCOUNT_EMPTY_VALUE_LABEL } from "../_constants/account-display-primitives";

import type { AccountSecuritySummary } from "../_types/account-security";
import type { AccountOrganisationContextData, AccountSettingsData } from "@/types/api/account";

export function formatAccountDisplayName(settings: AccountSettingsData): string {
  const first = settings.FirstName?.trim() ?? "";
  const last = settings.LastName?.trim() ?? "";
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;
  return ACCOUNT_EMPTY_VALUE_LABEL;
}

export function buildAccountSecuritySummary(
  settings: AccountSettingsData,
  context: AccountOrganisationContextData | undefined,
  loginEmail: string | undefined,
): AccountSecuritySummary {
  const organisationTitle = deriveOrganisationTitle(settings, context);
  const sportLabel = deriveSportLabel(settings, context);
  const accountTypeLabel = deriveAccountTypeLabel(
    settings.account_type ?? context?.account_type ?? null,
  );

  return {
    organisationTitle,
    loginEmail: loginEmail ?? ACCOUNT_EMPTY_VALUE_LABEL,
    sportLabel,
    accountTypeLabel,
    activeLabel: settings.isActive ? "Active" : "Inactive",
    setupLabel: settings.isSetup ? "Setup complete" : "Setup pending",
    displayName: formatAccountDisplayName(settings),
  };
}

function deriveOrganisationTitle(
  settings: AccountSettingsData,
  context: AccountOrganisationContextData | undefined,
): string {
  const fromOrg = context?.accountOrganisationDetails?.Name?.trim();
  if (fromOrg) return fromOrg;

  const fromOnboarding = settings.onboardingOrganisationName?.trim();
  if (fromOnboarding) return fromOnboarding;

  return ACCOUNT_EMPTY_VALUE_LABEL;
}

function deriveSportLabel(
  settings: AccountSettingsData,
  context: AccountOrganisationContextData | undefined,
): string {
  return (
    context?.accountOrganisationDetails?.Sport?.trim() ||
    settings.Sport?.trim() ||
    ACCOUNT_EMPTY_VALUE_LABEL
  );
}

function deriveAccountTypeLabel(accountTypeId: number | null | undefined): string {
  if (accountTypeId == null) return ACCOUNT_EMPTY_VALUE_LABEL;
  return accountTypeId === CLUB_ACCOUNT_TYPE_ID ? "Club" : "Association";
}
