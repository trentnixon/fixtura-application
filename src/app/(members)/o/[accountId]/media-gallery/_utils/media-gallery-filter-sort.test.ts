import { describe, expect, it } from "vitest";

import { buildMediaGalleryCategoryConfig } from "./media-gallery-category";
import { buildMediaGalleryCoverage } from "./media-gallery-coverage";
import {
  buildMediaGalleryOriginalIndexMap,
  filterMediaGalleryItems,
  sortMediaGalleryItems,
} from "./media-gallery-filter-sort";
import { MEDIA_LIBRARY_ASSET_TYPE_ALL } from "./media-gallery-form";
import { DEFAULT_MEDIA_GALLERY_QUERY_STATE } from "./media-gallery-query-state";

import type { AccountMediaLibraryItem } from "@/types/api/account";

const clubCategoryConfig = buildMediaGalleryCategoryConfig({
  settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
  competitions: [],
  gradeGroups: [],
  isLoading: false,
  isError: false,
});

const baseItem = (
  overrides: Partial<AccountMediaLibraryItem> & Pick<AccountMediaLibraryItem, "id" | "title">,
): AccountMediaLibraryItem => ({
  isActive: true,
  tags: [],
  ageGroup: "Both",
  assetTypes: [MEDIA_LIBRARY_ASSET_TYPE_ALL],
  markerPosition: [],
  image: {
    id: overrides.id,
    url: "https://example.com/a.jpg",
    width: null,
    height: null,
    mime: "image/jpeg",
  },
  ...overrides,
});

const items: AccountMediaLibraryItem[] = [
  baseItem({ id: 1, title: "Alpha", ageGroup: "Seniors", assetTypes: ["Team List"] }),
  baseItem({ id: 2, title: "Beta", ageGroup: "Juniors", isActive: false }),
  baseItem({ id: 3, title: "Gamma", ageGroup: "Both", assetTypes: ["Weekend Results"] }),
];

describe("filterMediaGalleryItems", () => {
  const coverage = buildMediaGalleryCoverage(
    items,
    [MEDIA_LIBRARY_ASSET_TYPE_ALL, "Team List", "Weekend Results"],
    clubCategoryConfig,
  );

  it("filters by search and status", () => {
    const filtered = filterMediaGalleryItems(
      items,
      {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        search: "a",
        status: "available",
      },
      { coverage, view: "pool", categoryConfig: clubCategoryConfig },
    );

    expect(filtered.map((item) => item.id)).toEqual([1, 3]);
  });

  it("filters by category and asset type", () => {
    const filtered = filterMediaGalleryItems(
      items,
      {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        categoryTargets: ["senior"],
        assetTypes: ["Team List"],
      },
      { coverage, view: "pool", categoryConfig: clubCategoryConfig },
    );

    expect(filtered.map((item) => item.id)).toEqual([1]);
  });

  it("filters by needs recategorisation", () => {
    const recatItems = [
      baseItem({
        id: 20,
        title: "Needs update",
        categoryStatus: "needs_reclassification",
        categoryAssignment: { type: "competition", scope: "all", targets: [] },
      }),
      baseItem({ id: 21, title: "Fine" }),
    ];

    const filtered = filterMediaGalleryItems(
      recatItems,
      {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        needsRecategorisation: true,
      },
      {
        coverage: buildMediaGalleryCoverage(
          recatItems,
          [MEDIA_LIBRARY_ASSET_TYPE_ALL],
          clubCategoryConfig,
        ),
        view: "pool",
        categoryConfig: clubCategoryConfig,
      },
    );

    expect(filtered.map((item) => item.id)).toEqual([20]);
  });

  it("filters by needs attention in category view", () => {
    const sparseItems = [
      baseItem({ id: 10, title: "Only seniors", ageGroup: "Seniors", isActive: true }),
      baseItem({ id: 11, title: "Only juniors", ageGroup: "Juniors", isActive: false }),
    ];
    const sparseCoverage = buildMediaGalleryCoverage(
      sparseItems,
      [MEDIA_LIBRARY_ASSET_TYPE_ALL, "Team List"],
      clubCategoryConfig,
    );

    const filtered = filterMediaGalleryItems(
      sparseItems,
      {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        needsAttention: true,
      },
      { coverage: sparseCoverage, view: "category", categoryConfig: clubCategoryConfig },
    );

    expect(filtered.map((item) => item.id)).toEqual([11]);
  });
});

describe("sortMediaGalleryItems", () => {
  const originalIndexById = buildMediaGalleryOriginalIndexMap(items);

  it("preserves API order for updated sort", () => {
    const shuffled: AccountMediaLibraryItem[] = [items[2]!, items[0]!, items[1]!];
    expect(
      sortMediaGalleryItems(shuffled, "updated", originalIndexById).map((item) => item.id),
    ).toEqual([1, 2, 3]);
  });

  it("sorts available first", () => {
    expect(
      sortMediaGalleryItems(items, "available", originalIndexById).map((item) => item.id),
    ).toEqual([1, 3, 2]);
  });

  it("sorts title A-Z", () => {
    expect(
      sortMediaGalleryItems(items, "title", originalIndexById).map((item) => item.title),
    ).toEqual(["Alpha", "Beta", "Gamma"]);
  });
});
