import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  RESULTS_COMPETITION,
  RESULTS_FIXTURE_IDS_IN_ORDER,
  RESULTS_GRADE_NAME,
  RESULTS_SCORE_PLANS,
  assertBattingPerformanceConsistency,
  assertBowlingPerformanceConsistency,
  generateResultsRows,
  PRESERVED_RESULTS_FRAMES,
  PRESERVED_RESULTS_TIMINGS,
} from "./generate-results-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedResultsDataset } from "./generate-results-dataset";

const FILE_PATH = path.join(process.cwd(), "public/dummyAssetData/Cricket/Cricket_Results.json");
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-results-dataset", () => {
  it("builds four internally consistent 2019 WC fictional scorecards", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const rows = generateResultsRows(manifest);
    expect(rows).toHaveLength(4);
    expect(RESULTS_SCORE_PLANS.map((plan) => plan.fixtureId)).toEqual([
      ...RESULTS_FIXTURE_IDS_IN_ORDER,
    ]);

    for (const row of rows) {
      expect(row.gradeName).toBe(RESULTS_GRADE_NAME);
      expect(row.round).toBe(RESULTS_GRADE_NAME);
      expect(row.type).toBe("One Day");
      expect(row.status).toBe("Final");
      expect(row.assignSponsors).toEqual({ team: [], grade: [], competition: [] });
      expect(row.homeTeam.name).toBe(row.resultSummary.homeTeam);
      expect(row.awayTeam.name).toBe(row.resultSummary.awayTeam);
      expect(row.teamHomeLogo.url).toBe(row.homeTeam.logo.url);
      expect(row.teamAwayLogo.url).toBe(row.awayTeam.logo.url);
      expect(row.result).toContain(row.resultSummary.winner);
      expect(row.resultShort).toContain(row.resultSummary.winner);
      expect(row.resultShort).toContain("def");

      const homeScore = Number(row.homeTeam.score);
      const awayScore = Number(row.awayTeam.score);
      const margin = Math.abs(homeScore - awayScore);
      expect(row.result).toContain(`won by ${margin} runs`);

      for (const batter of [
        ...row.homeTeam.battingPerformances,
        ...row.awayTeam.battingPerformances,
      ]) {
        assertBattingPerformanceConsistency(batter);
        expect([row.homeTeam.name, row.awayTeam.name]).toContain(batter.team);
      }
      for (const bowler of [
        ...row.homeTeam.bowlingPerformances,
        ...row.awayTeam.bowlingPerformances,
      ]) {
        assertBowlingPerformanceConsistency(bowler);
      }

      const prompt = JSON.parse(row.prompt) as {
        matchContext: { competition: string; note: string; resultStatement: string };
        homeTeam: { teamName: string; totalScore: string; totalWickets: number };
        awayTeam: { teamName: string; totalScore: string; totalWickets: number };
      };
      expect(prompt.matchContext.competition).toBe(RESULTS_COMPETITION);
      expect(prompt.matchContext.note).toContain("Fictional demonstration scorecard");
      expect(prompt.matchContext.resultStatement).toBe(row.result);
      expect(prompt.homeTeam.teamName).toBe(row.homeTeam.name);
      expect(prompt.awayTeam.teamName).toBe(row.awayTeam.name);
      expect(prompt.homeTeam.totalScore).toBe(row.homeTeam.score);
      expect(prompt.awayTeam.totalScore).toBe(row.awayTeam.score);
      expect(prompt).not.toHaveProperty("accountBias");
    }

    const indiaPakistan = rows[3]!;
    expect(indiaPakistan.homeTeam.name).toBe("India");
    expect(indiaPakistan.awayTeam.name).toBe("Pakistan");
    expect(indiaPakistan.homeTeam.score).toBe("315");
    expect(indiaPakistan.awayTeam.score).toBe("289");
    expect(indiaPakistan.result).toBe("India won by 26 runs");
  });
});

describe("sanitised Cricket_Results.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedResultsDataset>;

    expect(dataset.data).toHaveLength(4);
    expect(dataset.frames).toEqual([...PRESERVED_RESULTS_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_RESULTS_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const homeFlag = path.join(FLAGS_DIR, path.basename(row.teamHomeLogo.url));
      const awayFlag = path.join(FLAGS_DIR, path.basename(row.teamAwayLogo.url));
      expect(existsSync(homeFlag), `missing ${homeFlag}`).toBe(true);
      expect(existsSync(awayFlag), `missing ${awayFlag}`).toBe(true);
    }

    expect(raw).not.toMatch(/Strathmore|Sydenham|NWMCA|Boeing Reserve|Frank Dowling|fixtura\.s3/i);
    expect(raw).not.toContain('"accountId": 195');
    expect(raw).not.toContain("Demo Recreation");
  });
});
