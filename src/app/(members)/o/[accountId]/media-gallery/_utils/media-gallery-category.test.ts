import { describe, expect, it } from "vitest";

import {
  buildCategoryAssignmentFromSelection,
  buildClubAgeCategoryOptions,
  buildMediaGalleryCategoryConfig,
  categoryAssignmentEquals,
  categoryAssignmentToOptionIds,
  getEffectiveCategoryFromItem,
  itemBelongsToCategoryGroup,
  legacyAgeGroupToCategoryAssignment,
  toggleAssociationCategoryOption,
  toggleClubCategoryOption,
} from "./media-gallery-category";

import type { AccountMediaLibraryCategoryAssignmentWrite } from "@/types/api/account";

describe("legacyAgeGroupToCategoryAssignment", () => {
  it("maps legacy age groups to canonical assignments", () => {
    expect(legacyAgeGroupToCategoryAssignment("Both")).toEqual({
      type: "club-age",
      scope: "all",
      targets: [],
    });
    expect(legacyAgeGroupToCategoryAssignment("Juniors")).toEqual({
      type: "club-age",
      scope: "selected",
      targets: ["junior"],
    });
    expect(legacyAgeGroupToCategoryAssignment("Seniors")).toEqual({
      type: "club-age",
      scope: "selected",
      targets: ["senior", "masters"],
    });
  });
});

describe("club category toggles", () => {
  const config = buildMediaGalleryCategoryConfig({
    settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
    competitions: [],
    gradeGroups: [],
    isLoading: false,
    isError: false,
  });

  it("selects a single club age option exclusively", () => {
    const next = toggleClubCategoryOption(
      { type: "club-age", scope: "all", targets: [] },
      "junior",
      config,
    );
    expect(next).toEqual({ type: "club-age", scope: "selected", targets: ["junior"] });
  });

  it("clears back to All when toggling the active club option off", () => {
    const current = { type: "club-age" as const, scope: "selected" as const, targets: ["junior"] };
    const next = toggleClubCategoryOption(current, "junior", config);
    expect(next.scope).toBe("all");
    expect(next.targets).toEqual([]);
  });
});

describe("association category toggles", () => {
  const config = buildMediaGalleryCategoryConfig({
    settings: { account_type: 2, group_assets_by: false, split_seniors_and_masters: false },
    competitions: [
      {
        id: 10,
        name: "Premier",
        season: null,
        status: null,
        association: { id: 1, name: "Assoc" },
        counts: { grades: 1, teams: 1, fixtures: 1 },
        links: { self: "", grades: "" },
      },
      {
        id: 20,
        name: "Division 2",
        season: null,
        status: null,
        association: { id: 1, name: "Assoc" },
        counts: { grades: 1, teams: 1, fixtures: 1 },
        links: { self: "", grades: "" },
      },
    ],
    gradeGroups: [],
    isLoading: false,
    isError: false,
  });

  it("supports multi-select competition targets", () => {
    let current: AccountMediaLibraryCategoryAssignmentWrite = {
      type: "competition",
      scope: "all",
      targets: [],
    };
    current = toggleAssociationCategoryOption(current, "10", config);
    current = toggleAssociationCategoryOption(current, "20", config);
    expect(current).toEqual({
      type: "competition",
      scope: "selected",
      targets: [10, 20],
    });
    expect(categoryAssignmentToOptionIds(current, config.options)).toEqual(["10", "20"]);
  });
});

describe("itemBelongsToCategoryGroup", () => {
  const config = buildMediaGalleryCategoryConfig({
    settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: true },
    competitions: [],
    gradeGroups: [],
    isLoading: false,
    isError: false,
  });
  const juniorOption = buildClubAgeCategoryOptions(true)[0]!;

  it("places All-scope legacy rows in every group", () => {
    const item = { ageGroup: "Both" as const };
    expect(itemBelongsToCategoryGroup(item, juniorOption, config)).toBe(true);
  });

  it("excludes needs_reclassification rows from coverage groups", () => {
    const item = {
      ageGroup: "Both" as const,
      categoryAssignment: {
        type: "competition" as const,
        scope: "all" as const,
        targets: [],
      },
      categoryStatus: "needs_reclassification" as const,
    };
    expect(itemBelongsToCategoryGroup(item, juniorOption, config)).toBe(false);
  });
});

describe("categoryAssignmentEquals", () => {
  it("normalizes target order", () => {
    expect(
      categoryAssignmentEquals(
        { type: "club-age", scope: "selected", targets: ["masters", "senior"] },
        { type: "club-age", scope: "selected", targets: ["senior", "masters"] },
      ),
    ).toBe(true);
  });
});

describe("getEffectiveCategoryFromItem", () => {
  it("prefers canonical assignment when present", () => {
    const effective = getEffectiveCategoryFromItem(
      {
        ageGroup: "Both",
        categoryAssignment: { type: "competition", scope: "selected", targets: [42] },
        categoryStatus: "valid",
      },
      "competition",
    );
    expect(effective.targets).toEqual([42]);
  });
});

describe("buildCategoryAssignmentFromSelection", () => {
  const config = buildMediaGalleryCategoryConfig({
    settings: { account_type: 1, group_assets_by: false, split_seniors_and_masters: false },
    competitions: [],
    gradeGroups: [],
    isLoading: false,
    isError: false,
  });

  it("maps combined senior-masters option to both targets", () => {
    const assignment = buildCategoryAssignmentFromSelection({
      config,
      scope: "selected",
      selectedOptionIds: ["senior-masters"],
    });
    expect(assignment.targets).toEqual(["senior", "masters"]);
  });
});
