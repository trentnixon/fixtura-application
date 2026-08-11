import {
  normalizeTemplatePaletteNameToRemotionKey,
  type RemotionPaletteKey,
} from "@/features/remotion-asset-preview/utils/read-remotion-palette-key-from-branding";
import { tryNormalizeHex } from "@/lib/brand-color";

import type { TemplatePaletteItem } from "@/types/api/all-template-options";

const HIDDEN_COLOR_LAYOUT_PALETTE_KEYS = new Set<RemotionPaletteKey>([
  "accentPrimary",
  "accentSecondary",
]);

function resolvePaletteRemotionKey(palette: TemplatePaletteItem): RemotionPaletteKey | null {
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

function isHiddenAccentPaletteLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase();
  return normalized === "primary accent" || normalized === "secondary accent";
}

/** Palettes excluded from the Style tab Color Layout picker. */
export function isColorLayoutPaletteHidden(palette: TemplatePaletteItem): boolean {
  const key = resolvePaletteRemotionKey(palette);
  if (key !== null) return HIDDEN_COLOR_LAYOUT_PALETTE_KEYS.has(key);

  const name = palette.name?.trim() ?? "";
  if (name !== "" && isHiddenAccentPaletteLabel(name)) return true;

  const value = palette.value?.trim() ?? "";
  if (value !== "" && tryNormalizeHex(value) === null && isHiddenAccentPaletteLabel(value)) {
    return true;
  }

  return false;
}

export function filterColorLayoutPalettes(
  items: TemplatePaletteItem[],
  selectedId: number | null = null,
): TemplatePaletteItem[] {
  return items.filter(
    (palette) => palette.id === selectedId || !isColorLayoutPaletteHidden(palette),
  );
}
