import { describe, expect, it } from "vitest";

import { buildMediaGalleryCategoryConfig } from "./media-gallery-category";
import {
  buildMediaGalleryCoverage,
  countGroupsNeedingAttention,
  formatAssetTypeCoverageStatus,
  formatCategoryGroupCoverageStatus,
  getAssetTypeGroupCoverage,
  getCategoryGroupCoverage,
  getGroupsNeedingAttention,
  isUniversalAssignment,
} from "./media-gallery-coverage";
import { MEDIA_LIBRARY_ASSET_TYPE_ALL } from "./media-gallery-form";

const assetOptions = [MEDIA_LIBRARY_ASSET_TYPE_ALL, "Team List", "Weekend Results"] as const;

const clubCategoryConfig = buildMediaGalleryCategoryConfig({
  settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
  competitions: [],
  gradeGroups: [],
  isLoading: false,
  isError: false,
});

describe("isUniversalAssignment", () => {
  it("returns true only for ALL-only assignments", () => {
    expect(isUniversalAssignment([MEDIA_LIBRARY_ASSET_TYPE_ALL])).toBe(true);
    expect(isUniversalAssignment(["Team List", MEDIA_LIBRARY_ASSET_TYPE_ALL])).toBe(false);
    expect(isUniversalAssignment(["Team List"])).toBe(false);
  });
});

describe("getAssetTypeGroupCoverage", () => {
  it("treats active ALL as universal coverage for every specific type", () => {
    const coverage = getAssetTypeGroupCoverage(
      [{ assetTypes: [MEDIA_LIBRARY_ASSET_TYPE_ALL], ageGroup: "Both", isActive: true }],
      assetOptions,
    );

    expect(coverage).toEqual([
      expect.objectContaining({
        groupName: "Team List",
        directActive: 0,
        universalActive: 1,
        runtimeCovered: true,
        needsAttention: false,
      }),
      expect.objectContaining({
        groupName: "Weekend Results",
        directActive: 0,
        universalActive: 1,
        runtimeCovered: true,
        needsAttention: false,
      }),
    ]);
  });

  it("does not count inactive ALL toward runtime coverage", () => {
    const coverage = getAssetTypeGroupCoverage(
      [{ assetTypes: [MEDIA_LIBRARY_ASSET_TYPE_ALL], ageGroup: "Both", isActive: false }],
      assetOptions,
    );

    expect(coverage.every((group) => group.needsAttention)).toBe(true);
    expect(coverage.every((group) => group.universalActive === 0)).toBe(true);
  });

  it("counts direct active assignments separately from universal", () => {
    const coverage = getAssetTypeGroupCoverage(
      [
        { assetTypes: ["Team List"], ageGroup: "Both", isActive: true },
        { assetTypes: [MEDIA_LIBRARY_ASSET_TYPE_ALL], ageGroup: "Both", isActive: true },
      ],
      assetOptions,
    );

    const teamList = coverage.find((group) => group.groupName === "Team List");
    expect(teamList).toMatchObject({
      directActive: 1,
      universalActive: 1,
      needsAttention: false,
    });
  });

  it("marks specific types as uncovered when only inactive direct assignments exist", () => {
    const coverage = getAssetTypeGroupCoverage(
      [{ assetTypes: ["Weekend Results"], ageGroup: "Both", isActive: false }],
      assetOptions,
    );

    const weekend = coverage.find((group) => group.groupName === "Weekend Results");
    expect(weekend).toMatchObject({
      directActive: 0,
      inactiveDirect: 1,
      needsAttention: true,
    });
  });

  it("marks all specific types uncovered for an empty library", () => {
    const coverage = getAssetTypeGroupCoverage([], assetOptions);
    expect(coverage).toHaveLength(2);
    expect(coverage.every((group) => group.needsAttention)).toBe(true);
  });
});

describe("getCategoryGroupCoverage", () => {
  it("requires at least one active image for coverage", () => {
    const coverage = getCategoryGroupCoverage(
      [
        { assetTypes: ["Team List"], ageGroup: "Seniors", isActive: false },
        { assetTypes: ["Team List"], ageGroup: "Juniors", isActive: true },
      ],
      clubCategoryConfig,
    );

    expect(coverage.find((group) => group.groupId === "senior")).toMatchObject({
      active: 0,
      inactive: 1,
      needsAttention: true,
    });
    expect(coverage.find((group) => group.groupId === "junior")).toMatchObject({
      active: 1,
      needsAttention: false,
    });
  });

  it("excludes needs_reclassification rows from category coverage", () => {
    const coverage = getCategoryGroupCoverage(
      [
        {
          assetTypes: ["Team List"],
          ageGroup: "Both",
          isActive: true,
          categoryStatus: "needs_reclassification",
          categoryAssignment: { type: "competition", scope: "all", targets: [] },
        },
      ],
      clubCategoryConfig,
    );

    expect(coverage.every((group) => group.needsAttention)).toBe(true);
  });
});

describe("coverage summaries", () => {
  it("counts and lists groups needing attention for the active view", () => {
    const coverage = buildMediaGalleryCoverage(
      [{ assetTypes: ["Team List"], ageGroup: "Juniors", isActive: true }],
      assetOptions,
      clubCategoryConfig,
    );

    expect(countGroupsNeedingAttention(coverage, "asset")).toBe(1);
    expect(getGroupsNeedingAttention(coverage, "asset")).toEqual(["Weekend Results"]);
    expect(countGroupsNeedingAttention(coverage, "category")).toBe(2);
    expect(getGroupsNeedingAttention(coverage, "category")).toEqual(["Seniors", "Masters"]);
  });
});

describe("coverage status copy", () => {
  it("describes universal-only coverage without warning language", () => {
    expect(
      formatAssetTypeCoverageStatus({
        groupName: "Team List",
        directActive: 0,
        universalActive: 3,
        inactiveDirect: 0,
        runtimeCovered: true,
        needsAttention: false,
      }),
    ).toBe("0 specifically assigned · 3 universal backgrounds available");
  });

  it("describes uncovered groups with inactive assignments", () => {
    expect(
      formatCategoryGroupCoverageStatus({
        groupId: "senior",
        groupName: "Seniors",
        active: 0,
        inactive: 2,
        needsAttention: true,
      }),
    ).toBe("No active backgrounds · 2 inactive backgrounds assigned");
  });
});
