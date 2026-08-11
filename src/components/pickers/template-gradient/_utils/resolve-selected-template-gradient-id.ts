import type { TemplateGradientUiItem } from "@/types/api/template-gradients";

/**
 * Resolves the selected gradient id string against the current list.
 * Falls back to the first gradient when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateGradientIdString(
  gradients: TemplateGradientUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (gradients.length === 0) return undefined;
  const idSet = new Set(gradients.map((g) => String(g.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = gradients[0];
  return first !== undefined ? String(first.id) : undefined;
}
