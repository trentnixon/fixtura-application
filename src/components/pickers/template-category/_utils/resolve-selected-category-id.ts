import type { TemplateCategoryCatalogItem } from "@/types/api/account";

/**
 * Resolves the selected category id string against the current list.
 * Falls back to the first category when the stored id is missing or invalid.
 */
export function resolveSelectedCategoryIdString(
  categories: TemplateCategoryCatalogItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (categories.length === 0) return undefined;
  const idSet = new Set(categories.map((c) => String(c.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = categories[0];
  return first !== undefined ? String(first.id) : undefined;
}
