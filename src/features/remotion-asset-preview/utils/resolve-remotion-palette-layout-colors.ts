import tinycolor from "tinycolor2";

import { tryNormalizeHex } from "@/lib/brand-color";

import {
  normalizeTemplatePaletteNameToRemotionKey,
  type RemotionPaletteKey,
} from "./read-remotion-palette-key-from-branding";

import type { ThemePaletteFromBranding } from "@/lib/branding/theme-colours-from-account";
import type { TemplatePaletteItem } from "@/types/api/all-template-options";

const COLOR_ANGLE_ANALOGOUS = 30;
const COLOR_ANGLE_ACCENT = 30;

export type RemotionPaletteLayoutColors = {
  key: RemotionPaletteKey;
  left: string;
  right: string;
};

function getComplementaryColor(color: string): string {
  return tinycolor(color).complement().toString();
}

function getAnalogousColor(color: string, angle = COLOR_ANGLE_ANALOGOUS): string {
  return tinycolor(color).spin(angle).toString();
}

function getTriadicColor(color: string, index = 0): string {
  const triad = tinycolor(color).triad();
  const normalizedIndex = ((index % 3) + 3) % 3;
  return triad[normalizedIndex]!.toString();
}

function getAccentColor(color: string): string {
  return tinycolor(color).spin(COLOR_ANGLE_ACCENT).saturate(10).toString();
}

/**
 * Mirrors vendor `createPaletteConfigurations(primary, secondary)` color pairs.
 * Keep in sync with fixtura-remotion-assets color system when layouts change.
 */
export function buildRemotionPaletteLayoutColorPairs(
  primary: string,
  secondary: string,
): Record<RemotionPaletteKey, readonly [string, string]> {
  return {
    primary: [primary, secondary],
    primaryOnWhite: [primary, "white"],
    primaryOnBlack: [primary, "black"],
    secondary: [secondary, primary],
    secondaryOnWhite: [secondary, "white"],
    secondaryOnBlack: [secondary, "black"],
    accentPrimary: [getAccentColor(primary), getComplementaryColor(primary)],
    accentSecondary: [getAccentColor(secondary), getComplementaryColor(secondary)],
    complementary: [primary, getComplementaryColor(primary)],
    analogous: [primary, getAnalogousColor(primary, COLOR_ANGLE_ANALOGOUS)],
    triadic: [primary, getTriadicColor(primary, 1)],
    monochromatic: [primary, primary],
    highContrast: [primary, secondary],
  };
}

function resolveRemotionKeyFromPaletteItem(
  palette: TemplatePaletteItem,
): RemotionPaletteKey | null {
  const value = palette.value?.trim() ?? "";
  if (value !== "" && tryNormalizeHex(value) === null) {
    const fromValue = normalizeTemplatePaletteNameToRemotionKey(value);
    if (fromValue !== null) return fromValue;
  }

  const name = palette.name?.trim() ?? "";
  if (name !== "") {
    const fromName = normalizeTemplatePaletteNameToRemotionKey(name);
    if (fromName !== null) return fromName;
  }

  return null;
}

export function resolveRemotionPaletteLayoutColorsFromKey(
  key: RemotionPaletteKey,
  brandColors: Pick<ThemePaletteFromBranding, "primary" | "secondary">,
): RemotionPaletteLayoutColors {
  const pairs = buildRemotionPaletteLayoutColorPairs(brandColors.primary, brandColors.secondary);
  const [left, right] = pairs[key];
  return { key, left, right };
}

export function resolveRemotionPaletteLayoutColors(
  palette: TemplatePaletteItem,
  brandColors: Pick<ThemePaletteFromBranding, "primary" | "secondary">,
): RemotionPaletteLayoutColors | null {
  const key = resolveRemotionKeyFromPaletteItem(palette);
  if (key === null) return null;
  return resolveRemotionPaletteLayoutColorsFromKey(key, brandColors);
}

/** CSS background for a 50/50 horizontal split tile. */
export function remotionPaletteLayoutSplitBackground(left: string, right: string): string {
  return `linear-gradient(to right, ${left} 50%, ${right} 50%)`;
}
