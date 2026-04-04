import type {
  AccountMePayload,
  AccountOrganisationDetails,
  AccountSummary,
} from "@/types/api/account";

/**
 * Organisation display fields for a picker row. Prefer legacy `contentHub` when both exist
 * so single-account payloads keep prior behaviour; `accounts[]` rows typically only set top-level `accountOrganisationDetails`.
 */
export function organisationDetailsFromAccountRow(
  row: AccountSummary,
): AccountOrganisationDetails | undefined {
  return row.contentHub?.accountOrganisationDetails ?? row.accountOrganisationDetails;
}

/**
 * Rows for the org picker: prefers `accounts[]`, falls back to legacy single `accountId` + contentHub.
 */
export function accountPickerRowsFromMePayload(
  payload: AccountMePayload | undefined,
): AccountSummary[] {
  if (!payload) return [];
  const accounts = payload.accounts ?? [];
  if (accounts.length > 0) return accounts;
  if (payload.accountId != null) {
    return [{ id: payload.accountId, contentHub: payload.contentHub }];
  }
  return [];
}
