import { organisationDetailsFromAccountRow } from "@/lib/account/account-me-rows";

import type { AccountMeUser, AccountSummary } from "@/types/api/account";

/** Aligns with onboarding org name validation cap. */
export const ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH = 255;

export type BuildOnboardingCustomThemeNameResult = {
  /** Truncated combined label for POST …/onboarding/step-2/theme `name`. */
  name: string;
  /** True when both user and organisation parts are present. */
  isComplete: boolean;
};

function userPartFromRowAndUser(
  accountRow: AccountSummary | undefined,
  user: AccountMeUser | null,
): string {
  const fn = accountRow?.FirstName?.trim() ?? "";
  const ln = accountRow?.LastName?.trim() ?? "";
  const fromNames = [fn, ln].filter(Boolean).join(" ").trim();
  if (fromNames) return fromNames;
  const u = user?.username?.trim() ?? "";
  if (u) return u;
  const email = user?.email?.trim() ?? "";
  if (!email) return "";
  const at = email.indexOf("@");
  return (at > 0 ? email.slice(0, at) : email).trim();
}

function orgPartFromRow(accountRow: AccountSummary | undefined): string {
  if (!accountRow) return "";
  const fromOnboarding = accountRow.onboardingOrganisationName?.trim() ?? "";
  if (fromOnboarding) return fromOnboarding;
  return organisationDetailsFromAccountRow(accountRow)?.Name?.trim() ?? "";
}

/**
 * Builds the private custom theme display name: `"{user} — {organisation}"`.
 * Used by onboarding Step 2 (branding) when the user chooses a custom theme.
 */
export function buildOnboardingCustomThemeName(params: {
  user: AccountMeUser | null;
  accountRow: AccountSummary | undefined;
}): BuildOnboardingCustomThemeNameResult {
  const userPart = userPartFromRowAndUser(params.accountRow, params.user);
  const orgPart = orgPartFromRow(params.accountRow);
  if (!userPart || !orgPart) {
    return { name: "", isComplete: false };
  }
  const raw = `${userPart} — ${orgPart}`;
  const name =
    raw.length > ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH
      ? raw.slice(0, ONBOARDING_CUSTOM_THEME_NAME_MAX_LENGTH)
      : raw;
  return { name, isComplete: true };
}
