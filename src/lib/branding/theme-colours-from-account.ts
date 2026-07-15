import { tryNormalizeHex } from "@/lib/brand-color";

import type {
  AccountBrandingTheme,
  AccountThemeSummary,
  OnboardingThemeOption,
} from "@/types/api/account";

/** Theme slice accepted from GET branding or GET /account/me bootstrap rows. */
export type AccountThemeColourSource = AccountBrandingTheme | AccountThemeSummary;

/** Default `dark` / `white` in theme JSON when absent or invalid. */
export const THEME_JSON_DEFAULT_DARK = "#111";
export const THEME_JSON_DEFAULT_WHITE = "#FFF";

const FALLBACK_PRIMARY = "#64748B";
const FALLBACK_SECONDARY = "#94A3B8";

function parseHexField(v: unknown): string | null {
  if (typeof v !== "string") return null;
  return tryNormalizeHex(v);
}

function parsePrimaryFromThemeJson(o: Record<string, unknown>): string | null {
  return (
    parseHexField(o["primary"]) ??
    parseHexField(o["PrimaryColour"]) ??
    parseHexField(o["primaryColour"]) ??
    parseHexField(o["Primary"]) ??
    parseHexField(o["primary_color"])
  );
}

function parseSecondaryFromThemeJson(o: Record<string, unknown>): string | null {
  return (
    parseHexField(o["secondary"]) ??
    parseHexField(o["SecondaryColour"]) ??
    parseHexField(o["secondaryColour"]) ??
    parseHexField(o["Secondary"]) ??
    parseHexField(o["secondary_color"])
  );
}

/** True when the Strapi theme JSON row has both brand colours as valid hex. */
export function accountThemeJsonHasExplicitPrimarySecondary(
  theme: AccountThemeColourSource | null | undefined,
): boolean {
  const raw = theme?.theme;
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return parsePrimaryFromThemeJson(o) !== null && parseSecondaryFromThemeJson(o) !== null;
}

export type ThemePaletteFromBranding = {
  primary: string;
  secondary: string;
  dark: string;
  white: string;
};

/**
 * Reads brand palette from Strapi `theme.theme` JSON on GET branding / L3 rows.
 * Expects `primary` / `secondary` / optional `dark` / `white` (hex). Legacy and alternate keys supported.
 */
export function themeColoursFromAccountBrandingTheme(
  theme: AccountThemeColourSource | null | undefined,
): ThemePaletteFromBranding {
  const raw = theme?.theme;
  if (!raw || typeof raw !== "object") {
    return {
      primary: FALLBACK_PRIMARY,
      secondary: FALLBACK_SECONDARY,
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    };
  }
  const o = raw as Record<string, unknown>;
  const p = parsePrimaryFromThemeJson(o);
  const s = parseSecondaryFromThemeJson(o);
  const d = parseHexField(o["dark"]) ?? THEME_JSON_DEFAULT_DARK;
  const w = parseHexField(o["white"]) ?? THEME_JSON_DEFAULT_WHITE;
  return {
    primary: p ?? FALLBACK_PRIMARY,
    secondary: s ?? FALLBACK_SECONDARY,
    dark: d,
    white: w,
  };
}

/**
 * Colours for the review step: uses GET branding theme JSON when it has both primaries;
 * otherwise, if the theme id matches a premade catalogue row, uses that row’s JSON (same idea as step 2).
 */
export function themeColoursForReviewStep(
  accountTheme: AccountThemeColourSource | null | undefined,
  catalogueRows: OnboardingThemeOption[] | undefined,
): ThemePaletteFromBranding {
  const fromApi = themeColoursFromAccountBrandingTheme(accountTheme);
  if (accountTheme?.id == null || !catalogueRows?.length) return fromApi;
  if (accountThemeJsonHasExplicitPrimarySecondary(accountTheme)) return fromApi;
  const row = catalogueRows.find((r) => r.id === accountTheme.id);
  if (!row?.theme || typeof row.theme !== "object") return fromApi;
  return themeColoursFromAccountBrandingTheme({
    id: row.id,
    name: row.label,
    theme: row.theme,
  });
}
