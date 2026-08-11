import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AssetListForSelectionItem } from "@/types/api/assets";

export type AssetsListCatalogueMode = "media-library" | "strict-sport";

function filterAssetsForCatalogue(
  assets: AssetListForSelectionItem[],
  sport: string | null,
  catalogueMode: AssetsListCatalogueMode,
): AssetListForSelectionItem[] {
  if (catalogueMode === "media-library") {
    return assets.filter((asset) => {
      const assetSport = asset.Sport?.trim() || null;
      if (assetSport === null) return true;
      if (!sport) return false;
      return assetSport.toLowerCase() === sport;
    });
  }

  if (!sport) return assets;
  return assets.filter((asset) => asset.Sport?.trim().toLowerCase() === sport);
}

/**
 * Published assets for selection UIs (GET /api/assets/list-for-selection).
 *
 * @see .comms/API/ASSETS-handoff-list-for-selection.md
 */
export function useAssetsListForSelection(options?: {
  enabled?: boolean;
  sport?: string | null;
  /**
   * `media-library` — CMS Media Gallery catalogue rules (globals + matching sport).
   * `strict-sport` — legacy filter used by other consumers (default).
   */
  catalogueMode?: AssetsListCatalogueMode;
}) {
  const enabled = options?.enabled ?? true;
  const sport = options?.sport?.trim().toLowerCase() || null;
  const catalogueMode = options?.catalogueMode ?? "strict-sport";
  return useQuery({
    queryKey: queryKeys.assets.listForSelection,
    queryFn: () => accountApi.getAssetsListForSelection(),
    select: (response) =>
      sport || catalogueMode === "media-library"
        ? {
            ...response,
            data: filterAssetsForCatalogue(response.data, sport, catalogueMode),
          }
        : response,
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
