import type {
  AccountMePayload,
  AccountOrganisationSummary,
  AccountSummary,
  AccountThemeSummary,
} from "@/types/api/account";

/**
 * Organisation display fields for a picker row. Prefer legacy nested `contentHub` when both exist
 * for older payloads; bootstrap rows typically set top-level `accountOrganisationDetails` only.
 */
export function organisationDetailsFromAccountRow(
  row: AccountSummary,
): AccountOrganisationSummary | undefined {
  return row.contentHub?.accountOrganisationDetails ?? row.accountOrganisationDetails ?? undefined;
}

/** Theme slice from a bootstrap account row. */
export function themeFromAccountMeRow(row: AccountSummary): AccountThemeSummary | null {
  return row.theme;
}

/**
 * Rows for the org picker: `data.accounts[]` only.
 * Does not synthesize a row from compatibility `data.accountId`.
 * Callers should only pass payloads that already passed `parseAccountMeResponse`
 * (or test fixtures with an explicit `accounts` array).
 */
export function accountPickerRowsFromMePayload(
  payload: AccountMePayload | undefined,
): AccountSummary[] {
  if (!payload) return [];
  return payload.accounts;
}

/**
 * Account row for scoped chrome (sidebar chip, prefill, etc.).
 * Requires an explicit `selectedAccountId`; never falls back to compatibility `accountId` or `accounts[0]`.
 */
export function activeAccountSummaryFromMePayload(
  payload: AccountMePayload | undefined,
  selectedAccountId: string | undefined,
): AccountSummary | undefined {
  if (!payload) return undefined;
  if (selectedAccountId == null || selectedAccountId === "") return undefined;

  const rows = accountPickerRowsFromMePayload(payload);
  return rows.find((r) => String(r.id) === selectedAccountId);
}
