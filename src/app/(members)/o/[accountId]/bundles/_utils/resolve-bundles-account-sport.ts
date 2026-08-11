import type { AccountOrganisationContextData, AccountSettingsData } from "@/types/api/account";

/** Same precedence as dashboard: organisation sport, then account settings. */
export function resolveBundlesAccountSport({
  organisationContext,
  settings,
}: {
  organisationContext: AccountOrganisationContextData | null | undefined;
  settings: AccountSettingsData | null | undefined;
}): string | null {
  const fromOrg = organisationContext?.accountOrganisationDetails?.Sport?.trim();
  if (fromOrg) return fromOrg;
  const fromSettings = settings?.Sport?.trim();
  return fromSettings || null;
}
