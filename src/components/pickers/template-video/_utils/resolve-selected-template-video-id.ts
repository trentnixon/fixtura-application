import type { TemplateVideoUiItem } from "@/types/api/template-videos";

/**
 * Resolves the selected video id string against the current list.
 * Falls back to the first video when the stored id is missing or invalid.
 */
export function resolveSelectedTemplateVideoIdString(
  videos: TemplateVideoUiItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (videos.length === 0) return undefined;
  const idSet = new Set(videos.map((item) => String(item.id)));
  if (selectedId != null && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = videos[0];
  return first !== undefined ? String(first.id) : undefined;
}
