import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  WEEKEND_RESULTS_FIXTURE_IDS,
  WEEKEND_RESULTS_GRADE,
  generateWeekendResultsRows,
  PRESERVED_WEEKEND_RESULTS_FRAMES,
  PRESERVED_WEEKEND_RESULTS_TIMINGS,
} from "./generate-weekend-results-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedWeekendResultsDataset } from "./generate-weekend-results-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_WeekendResultsSingle.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-weekend-results-dataset", () => {
  it("builds nine consistent fictional T20 scorecards", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const rows = generateWeekendResultsRows(manifest);
    expect(rows).toHaveLength(9);
    expect(WEEKEND_RESULTS_FIXTURE_IDS).toHaveLength(9);

    for (const row of rows) {
      expect(row.type).toBe("T20");
      expect(row.gradeName).toBe(WEEKEND_RESULTS_GRADE);
      expect(row.homeTeam.isClubTeam).toBe(false);
      expect(row.awayTeam.isClubTeam).toBe(false);
      expect(row.assignSponsors).toEqual({ competition: [], grade: [], team: [] });
      expect(row.result).toContain(row.resultSummary.winner);
      expect(row.resultShort).toContain("def");
      expect(row.teamHomeLogo.url).toBe(row.homeTeam.logo.url);
      expect(row.teamAwayLogo.url).toBe(row.awayTeam.logo.url);
      expect(row.homeTeam.battingPerformances.length).toBeGreaterThanOrEqual(2);
      expect(row.awayTeam.battingPerformances.length).toBeGreaterThanOrEqual(2);

      const prompt = JSON.parse(row.prompt) as {
        matchContext: { note: string; resultStatement: string };
        homeTeam: { totalScore: string };
        awayTeam: { totalScore: string };
      };
      expect(prompt.matchContext.note).toContain("Fictional demonstration scorecard");
      expect(prompt.matchContext.resultStatement).toBe(row.result);
      expect(prompt).not.toHaveProperty("accountBias");
    }
  });
});

describe("sanitised Cricket_WeekendResultsSingle.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedWeekendResultsDataset>;

    expect(dataset.data).toHaveLength(9);
    expect(dataset.frames).toEqual([...PRESERVED_WEEKEND_RESULTS_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_WEEKEND_RESULTS_TIMINGS);
    expect(dataset.account.accountId).toBe(0);

    for (const row of dataset.data) {
      expect(existsSync(path.join(FLAGS_DIR, path.basename(row.teamHomeLogo.url)))).toBe(true);
      expect(existsSync(path.join(FLAGS_DIR, path.basename(row.teamAwayLogo.url)))).toBe(true);
    }

    expect(raw).not.toMatch(/Runaway Bay|Queens 1st|Gold Coast|fixtura\.s3/i);
    expect(raw).not.toContain('"accountId": 430');
    expect(raw).not.toContain("Demo Recreation");
    expect(raw).not.toContain("accountBias");
  });
});
