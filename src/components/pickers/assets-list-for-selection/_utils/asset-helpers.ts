import type { AssetListForSelectionItem } from "@/types/api/assets";

/** Category “type” label from `asset_category` (Name, else Identifier). */
export function assetCategoryTypeLabel(asset: AssetListForSelectionItem): string | null {
  const cat = asset.asset_category;
  if (!cat) return null;
  const name = cat.Name?.trim();
  if (name) return name;
  const id = cat.Identifier?.trim();
  if (id) return id;
  return null;
}

/** Only assets in the Image Options category (excludes other asset_category rows). */
export function isImageOptionsAsset(asset: AssetListForSelectionItem): boolean {
  const cat = asset.asset_category;
  if (!cat) return false;
  const name = cat.Name?.trim().toLowerCase();
  if (name === "image options") return true;
  const id = cat.Identifier?.trim().toLowerCase().replace(/_/g, "-");
  return id === "image-options";
}
