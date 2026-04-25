import type { TemplatePatternUiItem } from "@/types/api/template-patterns";

/**
 * Resolves the selected pattern id string against the current list.
 * Falls back to the first pattern when the stored id is missing or invalid.
 */
export function resolveSelectedTemplatePatternIdString(
  patterns: TemplatePatternUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (patterns.length === 0) return undefined;
  const idSet = new Set(patterns.map((item) => String(item.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = patterns[0];
  return first !== undefined ? String(first.id) : undefined;
}
