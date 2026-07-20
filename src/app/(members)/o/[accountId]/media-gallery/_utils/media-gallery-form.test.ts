import { describe, expect, it } from "vitest";

import { buildMediaGalleryCategoryConfig } from "./media-gallery-category";
import {
  MEDIA_LIBRARY_ASSET_TYPE_ALL,
  findEmptyAssetTypeOptions,
  findEmptyCategoryOptions,
  itemBelongsToAssetTypeGroup,
  toggleAssetTypeSelection,
} from "./media-gallery-form";

const clubCategoryConfig = buildMediaGalleryCategoryConfig({
  settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
  competitions: [],
  gradeGroups: [],
  isLoading: false,
  isError: false,
});

describe("toggleAssetTypeSelection", () => {
  it("selecting ALL returns only ALL", () => {
    expect(toggleAssetTypeSelection(["Team List", "Weekend Results"], "ALL")).toEqual([
      MEDIA_LIBRARY_ASSET_TYPE_ALL,
    ]);
  });

  it("selecting a specific while ALL is active replaces ALL", () => {
    expect(toggleAssetTypeSelection([MEDIA_LIBRARY_ASSET_TYPE_ALL], "Team List")).toEqual([
      "Team List",
    ]);
  });

  it("selecting another specific adds it", () => {
    expect(toggleAssetTypeSelection(["Team List"], "Weekend Results")).toEqual([
      "Team List",
      "Weekend Results",
    ]);
  });

  it("deselecting the final specific restores ALL", () => {
    expect(toggleAssetTypeSelection(["Team List"], "Team List")).toEqual([
      MEDIA_LIBRARY_ASSET_TYPE_ALL,
    ]);
  });

  it("does not mutate the current array", () => {
    const current = ["Team List"];
    const next = toggleAssetTypeSelection(current, "Weekend Results");
    expect(current).toEqual(["Team List"]);
    expect(next).toEqual(["Team List", "Weekend Results"]);
  });
});

describe("itemBelongsToAssetTypeGroup", () => {
  it("places ALL-only items only in the ALL group", () => {
    expect(itemBelongsToAssetTypeGroup([MEDIA_LIBRARY_ASSET_TYPE_ALL], "ALL")).toBe(true);
    expect(itemBelongsToAssetTypeGroup([MEDIA_LIBRARY_ASSET_TYPE_ALL], "Team List")).toBe(false);
  });

  it("places multi-assigned items in each matching specific group", () => {
    const types = ["Upcoming Fixtures", "Weekend Results"];
    expect(itemBelongsToAssetTypeGroup(types, "Upcoming Fixtures")).toBe(true);
    expect(itemBelongsToAssetTypeGroup(types, "Weekend Results")).toBe(true);
    expect(itemBelongsToAssetTypeGroup(types, "ALL")).toBe(false);
  });
});

describe("empty filter options", () => {
  it("lists category options with no assigned images", () => {
    expect(
      findEmptyCategoryOptions(
        [{ ageGroup: "Seniors" }, { ageGroup: "Seniors" }],
        clubCategoryConfig.options,
        clubCategoryConfig,
      ),
    ).toEqual(["junior"]);
  });

  it("lists asset type options with no assigned images", () => {
    expect(
      findEmptyAssetTypeOptions(
        [{ assetTypes: ["Team List"] }, { assetTypes: [MEDIA_LIBRARY_ASSET_TYPE_ALL] }],
        [MEDIA_LIBRARY_ASSET_TYPE_ALL, "Team List", "Weekend Results"],
      ),
    ).toEqual(["Weekend Results"]);
  });
});
