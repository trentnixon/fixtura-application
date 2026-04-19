import type { AssetListForSelectionItem } from "@/types/api/assets";

export type SportGroup = {
  key: string;
  label: string;
  items: AssetListForSelectionItem[];
};
