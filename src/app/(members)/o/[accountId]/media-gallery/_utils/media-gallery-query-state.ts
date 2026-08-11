import type { MediaGalleryCategoryConfig } from "./media-gallery-category";

export type MediaGalleryView = "pool" | "category" | "asset";
export type MediaGallerySort = "updated" | "available" | "unavailable" | "title";
export type MediaGalleryStatusFilter = "all" | "available" | "unavailable";

export type MediaGalleryQueryState = {
  view: MediaGalleryView;
  search: string;
  status: MediaGalleryStatusFilter;
  /** Stable category option ids from category config */
  categoryTargets: string[];
  assetTypes: string[];
  sort: MediaGallerySort;
  needsAttention: boolean;
  needsRecategorisation: boolean;
};

export const DEFAULT_MEDIA_GALLERY_QUERY_STATE: MediaGalleryQueryState = {
  view: "pool",
  search: "",
  status: "all",
  categoryTargets: [],
  assetTypes: [],
  sort: "updated",
  needsAttention: false,
  needsRecategorisation: false,
};

const VALID_SORTS = new Set<MediaGallerySort>(["updated", "available", "unavailable", "title"]);
const VALID_STATUSES = new Set<MediaGalleryStatusFilter>(["all", "available", "unavailable"]);

export type MediaGalleryQueryValidationContext = {
  assetTypeOptions: readonly string[];
  categoryConfig: MediaGalleryCategoryConfig;
};

function parseCommaSeparated(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseView(value: string | null): MediaGalleryView {
  if (value === "category" || value === "asset" || value === "pool") return value;
  if (value === "age") return "category";
  return DEFAULT_MEDIA_GALLERY_QUERY_STATE.view;
}

function parseSort(value: string | null): MediaGallerySort {
  if (value && VALID_SORTS.has(value as MediaGallerySort)) {
    return value as MediaGallerySort;
  }
  return DEFAULT_MEDIA_GALLERY_QUERY_STATE.sort;
}

function parseStatus(value: string | null): MediaGalleryStatusFilter {
  if (value && VALID_STATUSES.has(value as MediaGalleryStatusFilter)) {
    return value as MediaGalleryStatusFilter;
  }
  return DEFAULT_MEDIA_GALLERY_QUERY_STATE.status;
}

function parseCategoryTargets(
  value: string | null,
  legacyAgeValue: string | null,
  categoryConfig: MediaGalleryCategoryConfig,
): string[] {
  const allowed = new Set(categoryConfig.options.map((option) => option.id));
  const raw = parseCommaSeparated(value ?? legacyAgeValue);
  const unique = new Set<string>();
  for (const entry of raw) {
    if (allowed.has(entry)) unique.add(entry);
  }
  return Array.from(unique);
}

function parseAssetTypes(value: string | null, assetTypeOptions: readonly string[]): string[] {
  const allowed = new Set(assetTypeOptions);
  const parsed = parseCommaSeparated(value);
  const unique = new Set<string>();
  for (const entry of parsed) {
    if (allowed.has(entry)) unique.add(entry);
  }
  return Array.from(unique);
}

type SearchParamsLike = Pick<URLSearchParams, "get">;

export function parseMediaGalleryQueryState(
  searchParams: SearchParamsLike,
  context: MediaGalleryQueryValidationContext,
): MediaGalleryQueryState {
  const view = parseView(searchParams.get("view"));

  return {
    view,
    search: searchParams.get("q")?.trim() ?? "",
    status: parseStatus(searchParams.get("status")),
    categoryTargets: parseCategoryTargets(
      searchParams.get("category"),
      searchParams.get("age"),
      context.categoryConfig,
    ),
    assetTypes: parseAssetTypes(searchParams.get("asset"), context.assetTypeOptions),
    sort: parseSort(searchParams.get("sort")),
    needsAttention: searchParams.get("attention") === "1",
    needsRecategorisation: searchParams.get("recategorise") === "1",
  };
}

export function serializeMediaGalleryQueryState(state: MediaGalleryQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.view !== DEFAULT_MEDIA_GALLERY_QUERY_STATE.view) {
    params.set("view", state.view);
  }
  if (state.search.trim()) {
    params.set("q", state.search.trim());
  }
  if (state.status !== DEFAULT_MEDIA_GALLERY_QUERY_STATE.status) {
    params.set("status", state.status);
  }
  if (state.categoryTargets.length > 0) {
    params.set("category", state.categoryTargets.join(","));
  }
  if (state.assetTypes.length > 0) {
    params.set("asset", state.assetTypes.join(","));
  }
  if (state.sort !== DEFAULT_MEDIA_GALLERY_QUERY_STATE.sort) {
    params.set("sort", state.sort);
  }
  if (state.needsAttention) {
    params.set("attention", "1");
  }
  if (state.needsRecategorisation) {
    params.set("recategorise", "1");
  }

  return params;
}

export function mediaGalleryQueryStateEquals(
  a: MediaGalleryQueryState,
  b: MediaGalleryQueryState,
): boolean {
  return (
    a.view === b.view &&
    a.search === b.search &&
    a.status === b.status &&
    a.sort === b.sort &&
    a.needsAttention === b.needsAttention &&
    a.needsRecategorisation === b.needsRecategorisation &&
    a.categoryTargets.length === b.categoryTargets.length &&
    a.assetTypes.length === b.assetTypes.length &&
    a.categoryTargets.every((value, index) => value === b.categoryTargets[index]) &&
    a.assetTypes.every((value, index) => value === b.assetTypes[index])
  );
}

export function countActiveMediaGalleryFilters(state: MediaGalleryQueryState): number {
  let count = 0;
  if (state.search.trim()) count += 1;
  if (state.status !== "all") count += 1;
  if (state.categoryTargets.length > 0) count += 1;
  if (state.assetTypes.length > 0) count += 1;
  if (state.needsAttention) count += 1;
  if (state.needsRecategorisation) count += 1;
  return count;
}

export function hasActiveMediaGalleryFilters(state: MediaGalleryQueryState): boolean {
  return countActiveMediaGalleryFilters(state) > 0;
}

/** @deprecated Use MediaGalleryView instead */
export type MediaGalleryGroupBy = Exclude<MediaGalleryView, "pool">;

export function groupedViewFromQueryState(view: MediaGalleryView): MediaGalleryGroupBy | null {
  if (view === "pool") return null;
  return view;
}
