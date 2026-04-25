import type { TemplateModeUiItem } from "@/types/api/template-modes";

/**
 * Resolves the selected mode id string against the current list.
 * Falls back to the first mode when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateModeIdString(
  modes: TemplateModeUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (modes.length === 0) return undefined;
  const idSet = new Set(modes.map((mode) => String(mode.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = modes[0];
  return first !== undefined ? String(first.id) : undefined;
}
