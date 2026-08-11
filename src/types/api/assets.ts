/**
 * GET /api/assets/list-for-selection (Next.js BFF; proxies Strapi).
 * @see .comms/API/ASSETS-handoff-list-for-selection.md
 */
export interface AssetListForSelectionResponse {
  data: AssetListForSelectionItem[];
}

/** Related asset category row when populated by Strapi. @see .comms/API/ASSETS-handoff-list-for-selection.md */
export interface AssetCategorySummary {
  id: number;
  Name: string | null;
  Identifier: string | null;
  description: string | null;
}

export interface AssetListForSelectionItem {
  id: number;
  Name: string | null;
  Sport: "Cricket" | "AFL" | "Hockey" | "Netball" | "Basketball" | null;
  CompositionID: string | null;
  Metadata: Record<string, unknown> | null;
  description: string | null;
  asset_category: AssetCategorySummary | null;
}
