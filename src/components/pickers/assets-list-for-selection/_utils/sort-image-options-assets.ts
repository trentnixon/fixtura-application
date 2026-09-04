import { IMAGE_OPTIONS_ASSET_COMPOSITION_ORDER } from "../_consts/image-options-asset-order";

import type { AssetListForSelectionItem } from "@/types/api/assets";

const compositionOrderIndex = new Map<string, number>(
  IMAGE_OPTIONS_ASSET_COMPOSITION_ORDER.map((compositionId, index) => [compositionId, index]),
);

const UNLISTED_COMPOSITION_SORT_INDEX = IMAGE_OPTIONS_ASSET_COMPOSITION_ORDER.length;

function compositionSortIndex(compositionId: string | null | undefined): number {
  const key = compositionId?.trim() ?? "";
  if (key === "") return UNLISTED_COMPOSITION_SORT_INDEX;
  return compositionOrderIndex.get(key) ?? UNLISTED_COMPOSITION_SORT_INDEX;
}

/** Sort Image Options assets by {@link IMAGE_OPTIONS_ASSET_COMPOSITION_ORDER}, then name, then id. */
export function sortImageOptionsAssets(
  items: readonly AssetListForSelectionItem[],
): AssetListForSelectionItem[] {
  return [...items].sort((a, b) => {
    const byComposition =
      compositionSortIndex(a.CompositionID) - compositionSortIndex(b.CompositionID);
    if (byComposition !== 0) return byComposition;

    const byName = (a.Name ?? "").localeCompare(b.Name ?? "", undefined, { sensitivity: "base" });
    if (byName !== 0) return byName;

    return a.id - b.id;
  });
}
