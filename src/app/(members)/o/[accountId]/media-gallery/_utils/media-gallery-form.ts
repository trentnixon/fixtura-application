import {
  categoryAssignmentEquals,
  defaultCategoryAssignmentWrite,
  getEffectiveCategoryFromItem,
  itemBelongsToCategoryGroup,
  type MediaGalleryCategoryConfig,
} from "./media-gallery-category";

import type {
  AccountMediaLibraryAssetType,
  AccountMediaLibraryCategoryAssignmentWrite,
  AccountMediaLibraryItem,
  AccountMediaLibraryMarkerPosition,
} from "@/types/api/account";
import type { AssetListForSelectionItem } from "@/types/api/assets";

export const MEDIA_LIBRARY_MAX_FILE_MB = 15;

/** @deprecated Legacy age enum — use categoryAssignment. */
export const MEDIA_LIBRARY_AGE_GROUPS = ["Seniors", "Juniors", "Both"] as const;

/** Special value: background applies to every asset type. */
export const MEDIA_LIBRARY_ASSET_TYPE_ALL = "ALL" as const;

/** Build select/group options from `["assets","list-for-selection"]` query data. */
export function buildMediaLibraryAssetTypeOptions(
  assets: AssetListForSelectionItem[] | undefined,
  extraValues: Iterable<string> = [],
): AccountMediaLibraryAssetType[] {
  const names = new Set<string>();
  for (const asset of assets ?? []) {
    const name = asset.Name?.trim();
    if (name) names.add(name);
  }
  for (const value of extraValues) {
    const trimmed = value.trim();
    if (trimmed) names.add(trimmed);
  }
  names.delete(MEDIA_LIBRARY_ASSET_TYPE_ALL);
  return [
    MEDIA_LIBRARY_ASSET_TYPE_ALL,
    ...Array.from(names).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
  ];
}

/**
 * Toggle an asset-type assignment with exclusive `ALL` semantics.
 * Does not mutate `current`.
 */
export function toggleAssetTypeSelection(
  current: readonly string[],
  value: string,
): AccountMediaLibraryAssetType[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return current.length > 0 ? [...current] : [MEDIA_LIBRARY_ASSET_TYPE_ALL];
  }

  if (trimmed === MEDIA_LIBRARY_ASSET_TYPE_ALL) {
    return [MEDIA_LIBRARY_ASSET_TYPE_ALL];
  }

  const withoutAll = current.filter(
    (entry) => entry !== MEDIA_LIBRARY_ASSET_TYPE_ALL && entry.trim().length > 0,
  );
  const has = withoutAll.includes(trimmed);
  const next = has ? withoutAll.filter((entry) => entry !== trimmed) : [...withoutAll, trimmed];

  return next.length === 0 ? [MEDIA_LIBRARY_ASSET_TYPE_ALL] : next;
}

export const DEFAULT_FOCAL_POINT = { top: 50, left: 50 } as const;

/** Focal-point UI deferred; keep form/API wiring for a later release. */
export const SHOW_MEDIA_LIBRARY_FOCAL_POINT_UI = false;

/** Tags UI deferred; keep form/API wiring for a later release. */
export const SHOW_MEDIA_LIBRARY_TAGS_UI = false;

export function parseTagsInput(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function formatTagsInput(tags: string[]): string {
  return tags.join(", ");
}

export function markerFromForm(
  useFocalPoint: boolean,
  top: number,
  left: number,
): AccountMediaLibraryMarkerPosition {
  if (!useFocalPoint) return [];
  return [{ top, left }];
}

export function formDefaultsFromItem(
  item: AccountMediaLibraryItem | undefined,
  categoryConfig: MediaGalleryCategoryConfig,
) {
  const marker = item?.markerPosition[0];
  const effective = item ? getEffectiveCategoryFromItem(item, categoryConfig.type) : null;
  const categoryAssignment: AccountMediaLibraryCategoryAssignmentWrite = effective
    ? { type: effective.type, scope: effective.scope, targets: [...effective.targets] }
    : defaultCategoryAssignmentWrite(categoryConfig);

  return {
    title: item?.title ?? "",
    tagsInput: item ? formatTagsInput(item.tags) : "",
    categoryAssignment,
    assetTypes: item?.assetTypes?.length ? [...item.assetTypes] : [MEDIA_LIBRARY_ASSET_TYPE_ALL],
    isActive: item?.isActive ?? true,
    useFocalPoint: Boolean(marker),
    markerTop: marker?.top ?? DEFAULT_FOCAL_POINT.top,
    markerLeft: marker?.left ?? DEFAULT_FOCAL_POINT.left,
  };
}

export function categoryAssignmentChangedOnEdit(
  item: AccountMediaLibraryItem,
  next: AccountMediaLibraryCategoryAssignmentWrite,
  categoryConfig: MediaGalleryCategoryConfig,
): boolean {
  const effective = getEffectiveCategoryFromItem(item, categoryConfig.type);
  const baseline: AccountMediaLibraryCategoryAssignmentWrite = {
    type: effective.type,
    scope: effective.scope,
    targets: [...effective.targets],
  };
  return !categoryAssignmentEquals(baseline, next);
}

export function clampFocalPercent(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FOCAL_POINT.top;
  return Math.min(100, Math.max(0, Math.round(value * 10000) / 10000));
}

/** Membership rule for asset-type grouping in the gallery grid. */
export function itemBelongsToAssetTypeGroup(
  assetTypes: readonly string[],
  groupName: string,
): boolean {
  if (groupName === MEDIA_LIBRARY_ASSET_TYPE_ALL) {
    return assetTypes.length === 1 && assetTypes[0] === MEDIA_LIBRARY_ASSET_TYPE_ALL;
  }
  return assetTypes.includes(groupName);
}

/** Category groups with no gallery items assigned. */
export function findEmptyCategoryOptions(
  items: readonly Pick<
    AccountMediaLibraryItem,
    "ageGroup" | "categoryAssignment" | "categoryStatus"
  >[],
  options: readonly { id: string }[],
  config: Pick<MediaGalleryCategoryConfig, "type" | "options">,
): string[] {
  return options
    .filter(
      (option) =>
        !items.some((item) =>
          itemBelongsToCategoryGroup(
            item,
            config.options.find((entry) => entry.id === option.id) ?? {
              id: option.id,
              label: option.id,
              targetKeys: [option.id],
              selectable: true,
            },
            config,
          ),
        ),
    )
    .map((option) => option.id);
}

/** Asset-type filter options with no gallery items assigned. */
export function findEmptyAssetTypeOptions(
  items: readonly Pick<AccountMediaLibraryItem, "assetTypes">[],
  options: readonly string[],
): string[] {
  return options.filter(
    (option) => !items.some((item) => itemBelongsToAssetTypeGroup(item.assetTypes ?? [], option)),
  );
}
