import type { TemplateImageUiItem } from "@/types/api/template-images";

/**
 * Resolves the selected image id string against the current list.
 * Falls back to the first image when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateImageIdString(
  images: TemplateImageUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (images.length === 0) return undefined;
  const idSet = new Set(images.map((img) => String(img.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = images[0];
  return first !== undefined ? String(first.id) : undefined;
}
