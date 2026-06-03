import { describe, expect, it } from "vitest";

import {
  formatFixtureTabLabel,
  getVisibleFixtureDetailTabs,
  isFixtureOutputsTabVisible,
  isFixtureScorecardTabVisible,
  resolveFixtureDetailActiveTab,
  resolveFixtureDetailDefaultTab,
} from "./season-fixture-tabs";

import type { SeasonFixtureViewModel } from "../_types";

function minimalFixtureModel(
  overrides: Partial<SeasonFixtureViewModel> = {},
): SeasonFixtureViewModel {
  return {
    fixtureRecord: undefined,
    gradeContext: undefined,
    teamsData: undefined,
    teamSides: null,
    downloadEntries: [],
    renderStatus: undefined,
    meta: undefined,
    context: undefined,
    headline: "Team A vs Team B",
    homeTeam: "Team A",
    awayTeam: "Team B",
    scorecardUrl: undefined,
    dateLabel: "—",
    contextMetaRows: [],
    hasOutputs: false,
    headerContextLine: null,
    isFinished: false,
    inningsScorecards: [],
    renderEntries: [],
    hasScorecardTables: false,
    showScorecardSection: false,
    gradeName: "Grade",
    competitionName: "Comp",
    competitionBreadcrumbLabel: "Comp",
    ...overrides,
  };
}

describe("season-fixture-tabs", () => {
  it("defaults to match tab", () => {
    expect(resolveFixtureDetailDefaultTab()).toBe("match");
  });

  it("lists match and teams when scorecard and outputs are hidden", () => {
    const model = minimalFixtureModel();
    expect(getVisibleFixtureDetailTabs(model)).toEqual(["match", "teams"]);
  });

  it("includes scorecard tab when innings tables exist", () => {
    const model = minimalFixtureModel({
      hasScorecardTables: true,
      showScorecardSection: true,
      inningsScorecards: [
        {
          key: "innings1",
          battingTitle: "Batting",
          bowlingTitle: "Bowling",
          battingHeaders: [],
          battingRows: [["1"]],
          bowlingHeaders: [],
          bowlingRows: [],
          hasFallOfWickets: false,
        },
      ],
    });
    expect(isFixtureScorecardTabVisible(model)).toBe(true);
    expect(getVisibleFixtureDetailTabs(model)).toEqual(["match", "scorecard", "teams"]);
  });

  it("hides scorecard tab when only a result statement exists", () => {
    const model = minimalFixtureModel({
      showScorecardSection: true,
      resultStatement: "Team A won",
    });
    expect(isFixtureScorecardTabVisible(model)).toBe(false);
    expect(getVisibleFixtureDetailTabs(model)).toEqual(["match", "teams"]);
  });

  it("includes outputs tab when outputs meta or content note exist", () => {
    expect(isFixtureOutputsTabVisible(minimalFixtureModel({ hasOutputs: true }))).toBe(true);
    expect(
      isFixtureOutputsTabVisible(
        minimalFixtureModel({
          contextMetaRows: [{ label: "Source", value: "CMS" }],
        }),
      ),
    ).toBe(true);
    expect(
      isFixtureOutputsTabVisible(
        minimalFixtureModel({
          contentNote: { hasBasePrompt: false, hasUpcomingFixturePrompt: false, summaryLines: [] },
        }),
      ),
    ).toBe(true);
  });

  it("falls back to first visible tab when active tab is hidden", () => {
    const visible = ["match", "teams"] as const;
    expect(resolveFixtureDetailActiveTab("scorecard", visible)).toBe("match");
    expect(resolveFixtureDetailActiveTab("teams", visible)).toBe("teams");
  });

  it("formats teams and outputs labels with counts", () => {
    const model = minimalFixtureModel({
      teamSides: {
        home: { name: "A", playerLines: ["P1", "P2"] },
        away: { name: "B", playerLines: ["P3"] },
      },
      hasOutputs: true,
      renderEntries: [{ id: 1, kind: "video", status: "done", processedAt: "" }],
      downloadEntries: [{ label: "PDF", href: "https://example.com" }],
    });
    expect(formatFixtureTabLabel("teams", model)).toBe("Teams (3)");
    expect(formatFixtureTabLabel("outputs", model)).toBe("Outputs (2)");
    expect(formatFixtureTabLabel("match", model)).toBe("Match");
  });
});
