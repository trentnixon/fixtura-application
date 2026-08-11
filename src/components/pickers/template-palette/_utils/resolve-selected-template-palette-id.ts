import type { TemplatePaletteUiItem } from "@/types/api/template-palettes";

/**
 * Resolves the selected palette id string against the current list.
 * Falls back to the first palette when the stored id is missing or invalid.
 */
export function resolveSelectedTemplatePaletteIdString(
  palettes: TemplatePaletteUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (palettes.length === 0) return undefined;
  const idSet = new Set(palettes.map((palette) => String(palette.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = palettes[0];
  return first !== undefined ? String(first.id) : undefined;
}
