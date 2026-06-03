import { describe, expect, it } from "vitest";

import fixtureDetailSample from "@/types/api/__fixtures__/season-hub-fixture-detail-81411.json";

import { extractFixtureRecord } from "./season-fixture";
import { buildInningsScorecards } from "./season-fixture-detail-model";
import { normalizeBattingScorecard, normalizeScorecardRow } from "./season-fixture-scorecard-rows";

const BATTING_HEADERS = ["Batters", "R", "B", "4S", "6s", "SR"];
const BOWLING_HEADERS = ["Bowlers", "O", "M", "R", "W", "E", "WD", "NB"];

describe("normalizeBattingScorecard", () => {
  it("splits PlayHQ batting into Name and How out columns", () => {
    const row = [
      "Moe Spencer",
      "Spencer",
      "c: Tahir Abbasb: Prince Handa",
      "c: Tahir Abbas b: Prince Handa",
      "31",
      "58",
      "0",
      "0",
      "53.44",
    ];
    const { headers, rows } = normalizeBattingScorecard(BATTING_HEADERS, [row]);
    expect(headers).toEqual(["Name", "How out", "R", "B", "4S", "6s", "SR"]);
    expect(rows[0]).toEqual([
      "Moe Spencer",
      "c: Tahir Abbas b: Prince Handa",
      "31",
      "58",
      "0",
      "0",
      "53.44",
    ]);
  });

  it("maps not-out batting rows from fixture sample", () => {
    const row = [
      "Alice Caldow (c)",
      "Caldow (c)",
      "not out",
      "not out",
      "119*",
      "77",
      "16",
      "1",
      "154.54",
    ];
    const { rows } = normalizeBattingScorecard(BATTING_HEADERS, [row]);
    expect(rows[0]).toEqual(["Alice Caldow (c)", "not out", "119*", "77", "16", "1", "154.54"]);
  });
});

describe("normalizeScorecardRow", () => {
  it("maps PlayHQ bowling rows to header columns", () => {
    const row = ["Di Venuto (c)", "Venuto (c)", "4", "0", "32", "0", "8", "4", "0"];
    expect(normalizeScorecardRow(BOWLING_HEADERS, row)).toEqual([
      "Di Venuto (c)",
      "4",
      "0",
      "32",
      "0",
      "8",
      "4",
      "0",
    ]);
  });

  it("leaves already-aligned rows unchanged", () => {
    const row = ["Batter", "10", "8", "1", "0", "125"];
    expect(normalizeScorecardRow(BATTING_HEADERS, row)).toEqual(row);
  });
});

describe("buildInningsScorecards normalization", () => {
  it("normalizes sample fixture innings rows", () => {
    const fixture = extractFixtureRecord(fixtureDetailSample);
    const innings = buildInningsScorecards(fixture?.matchDetails?.scorecards);
    expect(innings[0]?.battingHeaders).toEqual(["Name", "How out", "R", "B", "4S", "6s", "SR"]);
    const firstBatting = innings[0]?.battingRows[0];
    expect(firstBatting).toHaveLength(7);
    expect(firstBatting?.[0]).toBe("Alice Caldow (c)");
    expect(firstBatting?.[1]).toBe("not out");
    expect(firstBatting?.[2]).toBe("119*");

    const firstBowling = innings[0]?.bowlingRows[0];
    expect(firstBowling).toHaveLength(8);
    expect(firstBowling?.[0]).toBe("Di Venuto (c)");
    expect(firstBowling?.[1]).toBe("4");
  });
});
