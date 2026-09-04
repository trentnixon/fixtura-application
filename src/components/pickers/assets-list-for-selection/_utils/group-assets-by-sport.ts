import { NO_SPORT_KEY } from "../_consts";
import { sortImageOptionsAssets } from "./sort-image-options-assets";

import type { SportGroup } from "../_types";
import type { AssetListForSelectionItem } from "@/types/api/assets";

export function groupAssetsBySport(items: AssetListForSelectionItem[]): SportGroup[] {
  const map = new Map<string, AssetListForSelectionItem[]>();
  for (const a of items) {
    const key = a.Sport ?? NO_SPORT_KEY;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }
  for (const [key, list] of map.entries()) {
    map.set(key, sortImageOptionsAssets(list));
  }
  const pairs = [...map.entries()].sort(([ka], [kb]) => {
    if (ka === NO_SPORT_KEY) return 1;
    if (kb === NO_SPORT_KEY) return -1;
    return ka.localeCompare(kb, undefined, { sensitivity: "base" });
  });
  return pairs.map(([key, groupItems]) => ({
    key,
    label: key === NO_SPORT_KEY ? "No sport" : key,
    items: groupItems,
  }));
}
