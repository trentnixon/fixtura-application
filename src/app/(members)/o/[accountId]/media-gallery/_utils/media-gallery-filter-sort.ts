import {
  getEffectiveCategoryFromItem,
  itemBelongsToCategoryGroup,
  itemNeedsRecategorisation,
  type MediaGalleryCategoryConfig,
} from "./media-gallery-category";
import { itemBelongsToAssetTypeGroup, MEDIA_LIBRARY_ASSET_TYPE_ALL } from "./media-gallery-form";

import type { MediaGalleryCoverage } from "./media-gallery-coverage";
import type {
  MediaGalleryQueryState,
  MediaGallerySort,
  MediaGalleryView,
} from "./media-gallery-query-state";
import type { AccountMediaLibraryItem } from "@/types/api/account";

export type MediaGalleryFilterContext = {
  coverage: MediaGalleryCoverage;
  view: MediaGalleryView;
  categoryConfig: MediaGalleryCategoryConfig;
};

function matchesSearch(item: AccountMediaLibraryItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return item.title.trim().toLowerCase().includes(query);
}

function matchesStatus(
  item: AccountMediaLibraryItem,
  status: MediaGalleryQueryState["status"],
): boolean {
  if (status === "all") return true;
  if (status === "available") return item.isActive;
  return !item.isActive;
}

function matchesCategoryTargets(
  item: AccountMediaLibraryItem,
  categoryTargets: MediaGalleryQueryState["categoryTargets"],
  categoryConfig: MediaGalleryCategoryConfig,
): boolean {
  if (categoryTargets.length === 0) return true;
  const effective = getEffectiveCategoryFromItem(item, categoryConfig.type);
  if (effective.scope === "all") {
    return categoryTargets.every((targetId) => {
      const option = categoryConfig.options.find((entry) => entry.id === targetId);
      return option != null;
    });
  }
  return categoryTargets.some((targetId) => {
    const option = categoryConfig.options.find((entry) => entry.id === targetId);
    if (!option) return false;
    return itemBelongsToCategoryGroup(item, option, categoryConfig);
  });
}

function matchesAssetTypes(
  item: AccountMediaLibraryItem,
  assetTypes: MediaGalleryQueryState["assetTypes"],
): boolean {
  if (assetTypes.length === 0) return true;
  const types = item.assetTypes ?? [];
  return assetTypes.some((assetType) => itemBelongsToAssetTypeGroup(types, assetType));
}

function getCategoryGroupsNeedingAttention(coverage: MediaGalleryCoverage): Set<string> {
  return new Set(
    coverage.categoryGroups.filter((group) => group.needsAttention).map((group) => group.groupId),
  );
}

function getAssetGroupsNeedingAttention(coverage: MediaGalleryCoverage): Set<string> {
  const names = coverage.assetTypeGroups
    .filter((group) => group.needsAttention)
    .map((group) => group.groupName);
  if (coverage.universalActiveCount === 0) {
    names.push(MEDIA_LIBRARY_ASSET_TYPE_ALL);
  }
  return new Set(names);
}

function itemNeedsAttentionInView(
  item: AccountMediaLibraryItem,
  context: MediaGalleryFilterContext,
): boolean {
  const { coverage, view, categoryConfig } = context;
  const categoryAttention = getCategoryGroupsNeedingAttention(coverage);
  const assetAttention = getAssetGroupsNeedingAttention(coverage);

  if (view === "category") {
    if (itemNeedsRecategorisation(item)) return true;
    if (categoryAttention.size === 0) return false;
    return categoryConfig.options.some(
      (option) =>
        categoryAttention.has(option.id) &&
        itemBelongsToCategoryGroup(item, option, categoryConfig),
    );
  }

  if (view === "asset") {
    const types = item.assetTypes ?? [];
    if (
      assetAttention.has(MEDIA_LIBRARY_ASSET_TYPE_ALL) &&
      itemBelongsToAssetTypeGroup(types, MEDIA_LIBRARY_ASSET_TYPE_ALL)
    ) {
      return true;
    }
    return types.some(
      (assetType) => assetType !== MEDIA_LIBRARY_ASSET_TYPE_ALL && assetAttention.has(assetType),
    );
  }

  if (itemNeedsRecategorisation(item)) return true;

  if (
    categoryConfig.options.some(
      (option) =>
        categoryAttention.has(option.id) &&
        itemBelongsToCategoryGroup(item, option, categoryConfig),
    )
  ) {
    return true;
  }

  const types = item.assetTypes ?? [];
  if (
    assetAttention.has(MEDIA_LIBRARY_ASSET_TYPE_ALL) &&
    itemBelongsToAssetTypeGroup(types, MEDIA_LIBRARY_ASSET_TYPE_ALL)
  ) {
    return true;
  }
  return types.some(
    (assetType) => assetType !== MEDIA_LIBRARY_ASSET_TYPE_ALL && assetAttention.has(assetType),
  );
}

export function filterMediaGalleryItems(
  items: readonly AccountMediaLibraryItem[],
  state: MediaGalleryQueryState,
  context: MediaGalleryFilterContext,
): AccountMediaLibraryItem[] {
  return items.filter((item) => {
    if (!matchesSearch(item, state.search)) return false;
    if (!matchesStatus(item, state.status)) return false;
    if (!matchesCategoryTargets(item, state.categoryTargets, context.categoryConfig)) {
      return false;
    }
    if (!matchesAssetTypes(item, state.assetTypes)) return false;
    if (state.needsRecategorisation && !itemNeedsRecategorisation(item)) return false;
    if (state.needsAttention && !itemNeedsAttentionInView(item, context)) return false;
    return true;
  });
}

export function buildMediaGalleryOriginalIndexMap(
  items: readonly AccountMediaLibraryItem[],
): Map<number, number> {
  const map = new Map<number, number>();
  items.forEach((item, index) => {
    map.set(item.id, index);
  });
  return map;
}

function compareBySort(
  a: AccountMediaLibraryItem,
  b: AccountMediaLibraryItem,
  sort: MediaGallerySort,
  originalIndexById: ReadonlyMap<number, number>,
): number {
  if (sort === "updated") {
    return (originalIndexById.get(a.id) ?? 0) - (originalIndexById.get(b.id) ?? 0);
  }

  if (sort === "available") {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return (originalIndexById.get(a.id) ?? 0) - (originalIndexById.get(b.id) ?? 0);
  }

  if (sort === "unavailable") {
    if (a.isActive !== b.isActive) return a.isActive ? 1 : -1;
    return (originalIndexById.get(a.id) ?? 0) - (originalIndexById.get(b.id) ?? 0);
  }

  const titleCompare = a.title.localeCompare(b.title, undefined, {
    sensitivity: "base",
  });
  if (titleCompare !== 0) return titleCompare;
  return (originalIndexById.get(a.id) ?? 0) - (originalIndexById.get(b.id) ?? 0);
}

/** Stable sort for gallery items. Does not mutate the input array. */
export function sortMediaGalleryItems(
  items: readonly AccountMediaLibraryItem[],
  sort: MediaGallerySort,
  originalIndexById: ReadonlyMap<number, number>,
): AccountMediaLibraryItem[] {
  return [...items].sort((a, b) => compareBySort(a, b, sort, originalIndexById));
}
