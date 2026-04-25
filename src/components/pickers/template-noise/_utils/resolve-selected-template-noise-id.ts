import type { TemplateNoiseUiItem } from "@/types/api/template-noises";

/**
 * Resolves the selected noise id string against the current list.
 * Falls back to the first noise when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateNoiseIdString(
  noises: TemplateNoiseUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (noises.length === 0) return undefined;
  const idSet = new Set(noises.map((noise) => String(noise.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = noises[0];
  return first !== undefined ? String(first.id) : undefined;
}
