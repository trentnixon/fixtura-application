import { describe, expect, it } from "vitest";

import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
} from "./account-summary-fixture";
import {
  buildSelectOrgSummaryStats,
  filterSelectOrgRowsBySearch,
  formatSelectOrgSummaryLine,
  sortSelectOrgRows,
} from "./select-organisation-workspace";

function row(
  id: number,
  name: string,
  over: Partial<ReturnType<typeof accountSummaryFixture>> = {},
) {
  return accountSummaryFixture({
    id,
    accountOrganisationDetails: accountOrganisationSummaryFixture({
      id,
      Name: name,
      href: "",
      ParentLogo: "",
      Sport: "Cricket",
    }),
    ...over,
  });
}

const emptyCtx = {
  simulating: false,
  onboardingStateByAccountId: new Map(),
};

describe("filterSelectOrgRowsBySearch", () => {
  const rows = [row(1, "Alpha Club"), row(2, "Beta Association")];

  it("returns all rows when query is empty", () => {
    expect(filterSelectOrgRowsBySearch(rows, "")).toEqual(rows);
    expect(filterSelectOrgRowsBySearch(rows, "   ")).toEqual(rows);
  });

  it("filters case-insensitively from one character", () => {
    expect(filterSelectOrgRowsBySearch(rows, "a")).toHaveLength(2);
    expect(filterSelectOrgRowsBySearch(rows, "beta")).toEqual([rows[1]]);
  });
});

describe("sortSelectOrgRows", () => {
  const rows = [row(1, "Zulu"), row(2, "Alpha"), row(3, "Mike")];

  it("sorts name ascending by default", () => {
    const sorted = sortSelectOrgRows(rows, "name-asc", emptyCtx);
    expect(sorted.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it("sorts name descending", () => {
    const sorted = sortSelectOrgRows(rows, "name-desc", emptyCtx);
    expect(sorted.map((r) => r.id)).toEqual([1, 3, 2]);
  });

  it("puts continue-setup rows first in setup-first mode", () => {
    const ctx = {
      simulating: true,
      onboardingStateByAccountId: new Map(),
    };
    const mixed = [
      row(1, "Done Club", { onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z" }),
      row(2, "Alpha Setup", { onboardingWizardCompletedAt: null }),
      row(3, "Zulu Setup", { onboardingWizardCompletedAt: null }),
    ];
    const sorted = sortSelectOrgRows(mixed, "setup-first", ctx);
    expect(sorted.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it("sorts newest first by createdAt descending", () => {
    const mixed = [
      row(1, "Old", { createdAt: "2026-01-01T00:00:00.000Z" }),
      row(2, "Newest", { createdAt: "2026-07-10T00:00:00.000Z" }),
      row(3, "Middle", { createdAt: "2026-03-01T00:00:00.000Z" }),
    ];
    const sorted = sortSelectOrgRows(mixed, "newest-first", emptyCtx);
    expect(sorted.map((r) => r.id)).toEqual([2, 3, 1]);
  });
});

describe("buildSelectOrgSummaryStats", () => {
  it("counts setup and inactive rows", () => {
    const ctx = {
      simulating: true,
      onboardingStateByAccountId: new Map(),
    };
    const stats = buildSelectOrgSummaryStats(
      [
        row(1, "A", { onboardingWizardCompletedAt: null, isActive: true }),
        row(2, "B", { onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z", isActive: false }),
        row(3, "C", { onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z", isActive: true }),
      ],
      ctx,
    );
    expect(stats).toEqual({ total: 3, needsSetup: 1, inactive: 1, active: 2 });
  });
});

describe("formatSelectOrgSummaryLine", () => {
  it("omits zero segments", () => {
    expect(formatSelectOrgSummaryLine({ total: 1, needsSetup: 0, inactive: 0, active: 1 })).toBe(
      "1 organisation",
    );
    expect(formatSelectOrgSummaryLine({ total: 12, needsSetup: 2, inactive: 1, active: 11 })).toBe(
      "12 organisations · 2 need setup · 1 inactive",
    );
  });
});
