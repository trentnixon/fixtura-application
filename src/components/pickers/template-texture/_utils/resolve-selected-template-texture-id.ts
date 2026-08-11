import type { TemplateTextureUiItem } from "@/types/api/template-textures";

/**
 * Resolves the selected texture id string against the current list.
 * Falls back to the first texture when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateTextureIdString(
  textures: TemplateTextureUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (textures.length === 0) return undefined;
  const idSet = new Set(textures.map((item) => String(item.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = textures[0];
  return first !== undefined ? String(first.id) : undefined;
}
