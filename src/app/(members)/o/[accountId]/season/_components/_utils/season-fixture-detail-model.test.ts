import { describe, expect, it } from "vitest";

import fixtureDetailSample from "@/types/api/__fixtures__/season-hub-fixture-detail-81411.json";

import { extractFixtureRecord, unwrapSeasonHubFixturePayload } from "./season-fixture";
import {
  buildInningsScorecards,
  buildMatchResultDisplay,
  buildRenderEntries,
  buildSeasonFixtureDetailDisplay,
  buildValidationDisplay,
} from "./season-fixture-detail-model";

describe("buildMatchResultDisplay", () => {
  it("maps result and toss from sample fixture", () => {
    const fixture = extractFixtureRecord(fixtureDetailSample);
    const display = buildMatchResultDisplay(fixture);
    expect(display.resultStatement).toBe("Waratah Women's Div 1 won by 67 runs");
    expect(display.tossLine).toContain("Waratah Women's Div 1");
    expect(display.tossLine).toContain("bat");
  });
});

describe("buildInningsScorecards", () => {
  it("returns two innings in stable order", () => {
    const fixture = extractFixtureRecord(fixtureDetailSample);
    const innings = buildInningsScorecards(fixture?.matchDetails?.scorecards);
    expect(innings).toHaveLength(2);
    expect(innings[0]?.key).toBe("innings1");
    expect(innings[1]?.key).toBe("innings2");
    expect(innings[0]?.battingRows.length).toBeGreaterThan(0);
    expect(innings[0]?.bowlingRows.length).toBeGreaterThan(0);
  });
});

describe("buildRenderEntries", () => {
  it("maps game result renders from sample body", () => {
    const body = unwrapSeasonHubFixturePayload(fixtureDetailSample);
    const entries = buildRenderEntries(body?.renderStatus);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries.some((e) => e.kind === "result" && e.id === 40420)).toBe(true);
  });
});

describe("buildValidationDisplay", () => {
  it("maps validation score and breakdown from sample", () => {
    const body = unwrapSeasonHubFixturePayload(fixtureDetailSample);
    const validation = buildValidationDisplay(body?.meta);
    expect(validation?.overallScore).toBe(82);
    expect(validation?.status).toBe("good");
    expect(validation?.breakdown.length).toBeGreaterThan(0);
  });
});

describe("buildSeasonFixtureDetailDisplay", () => {
  it("builds full display bundle from sample", () => {
    const body = unwrapSeasonHubFixturePayload(fixtureDetailSample);
    const fixture = extractFixtureRecord(fixtureDetailSample);
    const display = buildSeasonFixtureDetailDisplay(body, fixture);
    expect(display.hasScorecardTables).toBe(true);
    expect(display.isFinished).toBe(true);
    expect(display.inningsScorecards).toHaveLength(2);
    expect(display.renderEntries.length).toBeGreaterThanOrEqual(1);
  });
});
