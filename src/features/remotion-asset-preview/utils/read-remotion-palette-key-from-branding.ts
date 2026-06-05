import { tryNormalizeHex } from "@/lib/brand-color";

import type { AccountBrandingData } from "@/types/api/account";

/** Remotion color-system palette names from vendor `createPaletteConfigurations`. */
export const REMOTION_PALETTE_KEYS = [
  "primary",
  "primaryOnWhite",
  "primaryOnBlack",
  "secondary",
  "secondaryOnWhite",
  "secondaryOnBlack",
  "accentPrimary",
  "accentSecondary",
  "complementary",
  "analogous",
  "triadic",
  "monochromatic",
  "highContrast",
] as const;

export type RemotionPaletteKey = (typeof REMOTION_PALETTE_KEYS)[number];

const WHITELIST_SET = new Set<string>(REMOTION_PALETTE_KEYS);

function isWhitelistedKey(value: string): value is RemotionPaletteKey {
  return WHITELIST_SET.has(value);
}

function spacedLabelToCamelCase(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

/**
 * Maps a CMS palette `name` or `value` token to a Remotion `templateVariation.palette` key.
 */
export function normalizeTemplatePaletteNameToRemotionKey(
  candidate: string | null | undefined,
): RemotionPaletteKey | null {
  const trimmed = candidate?.trim() ?? "";
  if (trimmed === "") return null;

  if (isWhitelistedKey(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  for (const key of REMOTION_PALETTE_KEYS) {
    if (key.toLowerCase() === lower) return key;
  }

  const camel = spacedLabelToCamelCase(trimmed);
  if (camel !== "" && isWhitelistedKey(camel)) return camel;

  const camelLower = camel.toLowerCase();
  for (const key of REMOTION_PALETTE_KEYS) {
    if (key.toLowerCase() === camelLower) return key;
  }

  return null;
}

function resolveFromPaletteField(palette: unknown): RemotionPaletteKey | null {
  if (typeof palette === "string") {
    return normalizeTemplatePaletteNameToRemotionKey(palette);
  }

  if (palette == null || typeof palette !== "object" || Array.isArray(palette)) {
    return null;
  }

  const record = palette as Record<string, unknown>;
  const value = typeof record["value"] === "string" ? record["value"].trim() : "";
  if (value !== "" && tryNormalizeHex(value) === null) {
    const fromValue = normalizeTemplatePaletteNameToRemotionKey(value);
    if (fromValue !== null) return fromValue;
  }

  const name = typeof record["name"] === "string" ? record["name"].trim() : "";
  if (name !== "") {
    const fromName = normalizeTemplatePaletteNameToRemotionKey(name);
    if (fromName !== null) return fromName;
  }

  return null;
}

/**
 * Reads the Remotion palette variant key from account branding (`template_option` first, then theme JSON).
 */
export function readRemotionPaletteKeyFromBranding(
  branding: AccountBrandingData | null | undefined,
): RemotionPaletteKey | null {
  const opt = branding?.template_option;
  if (opt != null && typeof opt === "object" && !Array.isArray(opt)) {
    const fromOption = resolveFromPaletteField((opt as Record<string, unknown>)["palette"]);
    if (fromOption !== null) return fromOption;
  }

  const themeRow = branding?.theme?.theme;
  if (themeRow != null && typeof themeRow === "object" && !Array.isArray(themeRow)) {
    const fromTheme = resolveFromPaletteField((themeRow as Record<string, unknown>)["palette"]);
    if (fromTheme !== null) return fromTheme;
  }

  return null;
}
