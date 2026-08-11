import { describe, expect, it } from "vitest";

import { buildMediaGalleryCategoryConfig } from "./media-gallery-category";
import {
  countActiveMediaGalleryFilters,
  DEFAULT_MEDIA_GALLERY_QUERY_STATE,
  mediaGalleryQueryStateEquals,
  parseMediaGalleryQueryState,
  serializeMediaGalleryQueryState,
} from "./media-gallery-query-state";

const clubCategoryConfig = buildMediaGalleryCategoryConfig({
  settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
  competitions: [],
  gradeGroups: [],
  isLoading: false,
  isError: false,
});

describe("parseMediaGalleryQueryState", () => {
  const context = {
    assetTypeOptions: ["ALL", "Team List", "Weekend Results"],
    categoryConfig: clubCategoryConfig,
  };

  it("returns defaults for empty params", () => {
    expect(parseMediaGalleryQueryState(new URLSearchParams(), context)).toEqual(
      DEFAULT_MEDIA_GALLERY_QUERY_STATE,
    );
  });

  it("parses valid params", () => {
    const params = new URLSearchParams({
      view: "category",
      q: "  seniors  ",
      status: "available",
      category: "junior,senior",
      asset: "Team List,Unknown",
      sort: "title",
      attention: "1",
      recategorise: "1",
    });

    expect(parseMediaGalleryQueryState(params, context)).toEqual({
      view: "category",
      search: "seniors",
      status: "available",
      categoryTargets: ["junior", "senior"],
      assetTypes: ["Team List"],
      sort: "title",
      needsAttention: true,
      needsRecategorisation: true,
    });
  });

  it("maps legacy age view and params to category", () => {
    const params = new URLSearchParams({
      view: "age",
      age: "junior",
    });

    expect(parseMediaGalleryQueryState(params, context)).toEqual({
      ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
      view: "category",
      categoryTargets: ["junior"],
    });
  });

  it("falls back for unknown values", () => {
    const params = new URLSearchParams({
      view: "invalid",
      status: "maybe",
      sort: "newest",
      category: "Unknown",
    });

    expect(parseMediaGalleryQueryState(params, context)).toEqual({
      ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
      search: "",
    });
  });
});

describe("serializeMediaGalleryQueryState", () => {
  it("omits default values", () => {
    expect(serializeMediaGalleryQueryState(DEFAULT_MEDIA_GALLERY_QUERY_STATE).toString()).toBe("");
  });

  it("round-trips non-default state", () => {
    const context = {
      assetTypeOptions: ["ALL", "Team List"],
      categoryConfig: clubCategoryConfig,
    };
    const state = {
      view: "asset" as const,
      search: "match",
      status: "unavailable" as const,
      categoryTargets: ["junior"],
      assetTypes: ["Team List"],
      sort: "available" as const,
      needsAttention: true,
      needsRecategorisation: false,
    };

    const parsed = parseMediaGalleryQueryState(serializeMediaGalleryQueryState(state), context);
    expect(parsed).toEqual(state);
  });
});

describe("countActiveMediaGalleryFilters", () => {
  it("counts active filters only", () => {
    expect(countActiveMediaGalleryFilters(DEFAULT_MEDIA_GALLERY_QUERY_STATE)).toBe(0);
    expect(
      countActiveMediaGalleryFilters({
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        search: "a",
        status: "available",
        categoryTargets: ["junior"],
        needsAttention: true,
        needsRecategorisation: true,
      }),
    ).toBe(5);
  });
});

describe("mediaGalleryQueryStateEquals", () => {
  it("compares full state", () => {
    expect(
      mediaGalleryQueryStateEquals(DEFAULT_MEDIA_GALLERY_QUERY_STATE, {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
      }),
    ).toBe(true);
    expect(
      mediaGalleryQueryStateEquals(DEFAULT_MEDIA_GALLERY_QUERY_STATE, {
        ...DEFAULT_MEDIA_GALLERY_QUERY_STATE,
        view: "category",
      }),
    ).toBe(false);
  });
});
