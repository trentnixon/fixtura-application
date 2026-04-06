import type {
  AccountMePayload,
  AccountOrganisationDetails,
  AccountSummary,
} from "@/types/api/account";

/**
 * Organisation display fields for a picker row. Prefer legacy nested `contentHub` when both exist
 * for older payloads; bootstrap rows typically set top-level `accountOrganisationDetails` only.
 */
export function organisationDetailsFromAccountRow(
  row: AccountSummary,
): AccountOrganisationDetails | undefined {
  return row.contentHub?.accountOrganisationDetails ?? row.accountOrganisationDetails;
}

/**
 * Rows for the org picker: prefers `accounts[]`, falls back to synthetic row from `accountId` + optional legacy `contentHub`.
 */
export function accountPickerRowsFromMePayload(
  payload: AccountMePayload | undefined,
): AccountSummary[] {
  if (!payload) return [];
  const accounts = payload.accounts ?? [];
  if (accounts.length > 0) return accounts;
  if (payload.accountId != null && payload.accountId > 0) {
    const row: AccountSummary = { id: payload.accountId };
    if (payload.contentHub !== undefined) row.contentHub = payload.contentHub;
    return [row];
  }
  return [];
}

/**
 * The account row to use for shell chrome (sidebar user chip, etc.): matches `selectedAccountId` when
 * provided, otherwise the row for `payload.accountId`, else the first row.
 */
export function activeAccountSummaryFromMePayload(
  payload: AccountMePayload | undefined,
  selectedAccountId?: string,
): AccountSummary | undefined {
  if (!payload) return undefined;
  const rows = accountPickerRowsFromMePayload(payload);
  if (rows.length === 0) return undefined;

  const target =
    selectedAccountId != null && selectedAccountId !== ""
      ? selectedAccountId
      : String(payload.accountId);

  return rows.find((r) => String(r.id) === target) ?? rows[0];
}
