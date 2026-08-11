import { themeFromAccountMeRow } from "@/lib/account/account-me-rows";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { AccountSummary } from "@/types/api/account";

/** Accounts created within this window show a "New" badge on the org picker. */
export const SELECT_ORG_NEW_ACCOUNT_DAYS = 14;

const NEW_ACCOUNT_MS = SELECT_ORG_NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000;

export type SelectOrgCardBrandPalette = {
  primary: string;
  secondary: string;
};

/** True when `createdAt` is a valid ISO timestamp within the new-account window. */
export function isNewSelectOrgAccount(createdAt: string, now: Date = new Date()): boolean {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return false;
  const age = now.getTime() - created;
  return age >= 0 && age <= NEW_ACCOUNT_MS;
}

/** Brand palette from me-row `theme.theme` for org picker card surfaces. */
export function selectOrgCardBrandPalette(
  row: AccountSummary,
): SelectOrgCardBrandPalette | undefined {
  const theme = themeFromAccountMeRow(row);
  if (!theme) return undefined;
  const palette = themeColoursFromAccountBrandingTheme(theme);
  return { primary: palette.primary, secondary: palette.secondary };
}
