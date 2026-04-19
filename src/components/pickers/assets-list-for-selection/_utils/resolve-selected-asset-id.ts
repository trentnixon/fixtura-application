import type { AssetListForSelectionItem } from "@/types/api/assets";

/**
 * Resolves the selected asset id string against the current list.
 * Falls back to the first asset when the stored id is missing or invalid.
 */
export function resolveSelectedAssetIdString(
  assets: AssetListForSelectionItem[],
  selectedId: string | null | undefined,
): string | undefined {
  if (assets.length === 0) return undefined;
  const idSet = new Set(assets.map((a) => String(a.id)));
  if (selectedId != null && selectedId !== "" && idSet.has(selectedId)) {
    return selectedId;
  }
  const first = assets[0];
  return first !== undefined ? String(first.id) : undefined;
}
