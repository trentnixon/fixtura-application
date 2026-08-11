import { organisationDetailsFromAccountRow } from "@/lib/account/account-me-rows";

import type { AccountSummary } from "@/types/api/account";

/** Guide fallback when neither onboarding nor organisation details supply a usable name. */
export const UNFINISHED_ORGANISATION_DISPLAY_NAME = "Unfinished organisation";

function usableName(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Organisation-selection display name per the multi-account guide:
 * usable `onboardingOrganisationName`, then usable `accountOrganisationDetails.Name`,
 * else {@link UNFINISHED_ORGANISATION_DISPLAY_NAME}.
 */
export function organisationDisplayNameFromAccountRow(row: AccountSummary): string {
  const fromOnboarding = usableName(row.onboardingOrganisationName);
  if (fromOnboarding) return fromOnboarding;

  const details = organisationDetailsFromAccountRow(row);
  const fromDetails = usableName(details?.Name);
  if (fromDetails) return fromDetails;

  return UNFINISHED_ORGANISATION_DISPLAY_NAME;
}
