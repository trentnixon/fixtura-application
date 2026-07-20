import {
  getEffectiveCategoryFromItem,
  isAllScopeAssignment,
  itemBelongsToCategoryGroup,
  type MediaGalleryCategoryConfig,
} from "./media-gallery-category";
import { MEDIA_LIBRARY_ASSET_TYPE_ALL } from "./media-gallery-form";

import type { AccountMediaLibraryItem } from "@/types/api/account";

type CoverageItem = Pick<
  AccountMediaLibraryItem,
  "assetTypes" | "ageGroup" | "categoryAssignment" | "categoryStatus" | "isActive"
>;

export type AssetTypeGroupCoverage = {
  groupName: string;
  directActive: number;
  universalActive: number;
  inactiveDirect: number;
  runtimeCovered: boolean;
  needsAttention: boolean;
};

export type CategoryGroupCoverage = {
  groupId: string;
  groupName: string;
  active: number;
  inactive: number;
  needsAttention: boolean;
};

export type MediaGalleryCoverage = {
  assetTypeGroups: AssetTypeGroupCoverage[];
  categoryGroups: CategoryGroupCoverage[];
  universalActiveCount: number;
  recategorisationCount: number;
};

/** True when assignment is exactly `["ALL"]`. */
export function isUniversalAssignment(assetTypes: readonly string[]): boolean {
  return assetTypes.length === 1 && assetTypes[0] === MEDIA_LIBRARY_ASSET_TYPE_ALL;
}

/** Active items whose assignment is exactly ALL. */
export function countUniversalActive(items: readonly CoverageItem[]): number {
  return items.filter((item) => item.isActive && isUniversalAssignment(item.assetTypes ?? []))
    .length;
}

/** Specific asset-type options (excludes ALL). */
export function getSpecificAssetTypeOptions(assetTypeOptions: readonly string[]): string[] {
  return assetTypeOptions.filter((option) => option !== MEDIA_LIBRARY_ASSET_TYPE_ALL);
}

export function getAssetTypeGroupCoverage(
  items: readonly CoverageItem[],
  assetTypeOptions: readonly string[],
): AssetTypeGroupCoverage[] {
  const universalActive = countUniversalActive(items);
  const specificOptions = getSpecificAssetTypeOptions(assetTypeOptions);

  return specificOptions.map((groupName) => {
    let directActive = 0;
    let inactiveDirect = 0;

    for (const item of items) {
      const types = item.assetTypes ?? [];
      if (isUniversalAssignment(types)) continue;
      if (!types.includes(groupName)) continue;
      if (item.isActive) directActive += 1;
      else inactiveDirect += 1;
    }

    const runtimeCovered = directActive > 0 || universalActive > 0;

    return {
      groupName,
      directActive,
      universalActive,
      inactiveDirect,
      runtimeCovered,
      needsAttention: !runtimeCovered,
    };
  });
}

export function getCategoryGroupCoverage(
  items: readonly CoverageItem[],
  categoryConfig: MediaGalleryCategoryConfig,
): CategoryGroupCoverage[] {
  return categoryConfig.options.map((option) => {
    let active = 0;
    let inactive = 0;

    for (const item of items) {
      const effective = getEffectiveCategoryFromItem(item, categoryConfig.type);
      if (effective.status === "needs_reclassification") continue;
      if (!itemBelongsToCategoryGroup(item, option, categoryConfig)) continue;
      if (item.isActive) active += 1;
      else inactive += 1;
    }

    return {
      groupId: option.id,
      groupName: option.label,
      active,
      inactive,
      needsAttention: active === 0,
    };
  });
}

export function countRecategorisationItems(items: readonly CoverageItem[]): number {
  return items.filter((item) => item.categoryStatus === "needs_reclassification").length;
}

export function buildMediaGalleryCoverage(
  items: readonly CoverageItem[],
  assetTypeOptions: readonly string[],
  categoryConfig: MediaGalleryCategoryConfig,
): MediaGalleryCoverage {
  return {
    assetTypeGroups: getAssetTypeGroupCoverage(items, assetTypeOptions),
    categoryGroups: getCategoryGroupCoverage(items, categoryConfig),
    universalActiveCount: countUniversalActive(items),
    recategorisationCount: countRecategorisationItems(items),
  };
}

export function countGroupsNeedingAttention(
  coverage: MediaGalleryCoverage,
  groupBy: "category" | "asset",
): number {
  if (groupBy === "category") {
    return coverage.categoryGroups.filter((group) => group.needsAttention).length;
  }
  return coverage.assetTypeGroups.filter((group) => group.needsAttention).length;
}

export function getGroupsNeedingAttention(
  coverage: MediaGalleryCoverage,
  groupBy: "category" | "asset",
): string[] {
  if (groupBy === "category") {
    return coverage.categoryGroups
      .filter((group) => group.needsAttention)
      .map((group) => group.groupName);
  }
  return coverage.assetTypeGroups
    .filter((group) => group.needsAttention)
    .map((group) => group.groupName);
}

export function formatAssetTypeCoverageStatus(coverage: AssetTypeGroupCoverage): string {
  if (coverage.needsAttention) {
    if (coverage.inactiveDirect > 0) {
      const noun = coverage.inactiveDirect === 1 ? "inactive background" : "inactive backgrounds";
      return `No active backgrounds · ${coverage.inactiveDirect} ${noun} assigned`;
    }
    return "No active backgrounds assigned";
  }

  if (coverage.directActive === 0 && coverage.universalActive > 0) {
    const noun = coverage.universalActive === 1 ? "universal background" : "universal backgrounds";
    return `0 specifically assigned · ${coverage.universalActive} ${noun} available`;
  }

  const directNoun = coverage.directActive === 1 ? "background" : "backgrounds";
  if (coverage.universalActive > 0) {
    const universalNoun =
      coverage.universalActive === 1 ? "universal background" : "universal backgrounds";
    return `${coverage.directActive} ${directNoun} assigned · ${coverage.universalActive} ${universalNoun} available`;
  }

  return `${coverage.directActive} ${directNoun} assigned`;
}

export function formatCategoryGroupCoverageStatus(coverage: CategoryGroupCoverage): string {
  if (coverage.needsAttention) {
    if (coverage.inactive > 0) {
      const noun = coverage.inactive === 1 ? "inactive background" : "inactive backgrounds";
      return `No active backgrounds · ${coverage.inactive} ${noun} assigned`;
    }
    return "No active backgrounds assigned";
  }

  const noun = coverage.active === 1 ? "background" : "backgrounds";
  return `${coverage.active} active ${noun} assigned`;
}

export function mediaGalleryGroupDomId(groupBy: "category" | "asset", groupName: string): string {
  const slug = groupName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `media-gallery-group-${groupBy}-${slug || "unknown"}`;
}

export function itemHasUniversalCategoryCoverage(
  item: CoverageItem,
  categoryConfig: MediaGalleryCategoryConfig,
): boolean {
  const effective = getEffectiveCategoryFromItem(item, categoryConfig.type);
  if (effective.status === "needs_reclassification") return false;
  return isAllScopeAssignment(effective);
}
