import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  BATTING_PERFORMANCES_POOL_ID,
  BATTING_PERFORMANCES_VENUE_IDS,
  generateBattingPerformanceRows,
  generateFictionalInnings,
  PRESERVED_BATTING_PERFORMANCES_FRAMES,
  PRESERVED_BATTING_PERFORMANCES_TIMINGS,
} from "./generate-batting-performances-dataset";
import { strikeRateFromRunsAndBalls } from "./generate-top5-batters-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedBattingPerformancesDataset } from "./generate-batting-performances-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_BattingPerformances.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-batting-performances-dataset", () => {
  it("builds 19 seeded innings within batting guidelines", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const guidelines = manifest.syntheticGeneration.battingGuidelines as {
      runsRange: [number, number];
      ballsRange: [number, number];
      strikeRateRange: [number, number];
    };
    const pool = manifest.playerPools.find((item) => item.id === BATTING_PERFORMANCES_POOL_ID);
    expect(pool?.players).toHaveLength(19);

    const sample = generateFictionalInnings({
      seed: manifest.syntheticGeneration.seed,
      playerKey: "sample",
      runsRange: guidelines.runsRange,
      ballsRange: guidelines.ballsRange,
      strikeRateRange: guidelines.strikeRateRange,
    });
    expect(sample.runs).toBeGreaterThanOrEqual(guidelines.runsRange[0]);
    expect(sample.runs).toBeLessThanOrEqual(guidelines.runsRange[1]);
    expect(sample.balls).toBeGreaterThanOrEqual(guidelines.ballsRange[0]);
    expect(sample.balls).toBeLessThanOrEqual(guidelines.ballsRange[1]);
    expect(sample.SR).toBe(strikeRateFromRunsAndBalls(sample.runs, sample.balls));
    expect(sample.SR).toBeGreaterThanOrEqual(guidelines.strikeRateRange[0]);
    expect(sample.SR).toBeLessThanOrEqual(guidelines.strikeRateRange[1]);

    const rows = generateBattingPerformanceRows(manifest);
    expect(rows).toHaveLength(19);
    expect(rows.map((row) => row.name)).toEqual(pool!.players.map((player) => player.name));

    let notOutCount = 0;
    for (const row of rows) {
      expect(row.SR).toBe(strikeRateFromRunsAndBalls(row.runs, row.balls));
      expect(row.prompt).toContain("fictional demonstration performance");
      expect(row.assignSponsors).toEqual({ competition: [], grade: [], team: [] });
      expect(row.primaryForScreen).toEqual([]);
      expect(row.playedFor.length).toBeGreaterThan(0);
      expect(row.teamLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
      expect(
        BATTING_PERFORMANCES_VENUE_IDS.some((venueId) => {
          const venue = manifest.venues.find((item) => item.id === venueId);
          return venue ? row.prompt.includes(venue.displayName) : false;
        }),
      ).toBe(true);
      if (row.notOut) {
        notOutCount += 1;
      }
    }
    expect(notOutCount).toBeGreaterThan(0);
    expect(notOutCount).toBeLessThan(rows.length);
  });
});

describe("sanitised Cricket_BattingPerformances.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedBattingPerformancesDataset>;

    expect(dataset.data).toHaveLength(19);
    expect(dataset.frames).toEqual([...PRESERVED_BATTING_PERFORMANCES_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_BATTING_PERFORMANCES_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const flagFile = path.join(FLAGS_DIR, path.basename(row.teamLogo.url));
      expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
    }

    expect(raw).not.toMatch(/Goulburn|SJCC|MadBulls|fixtura\.s3|Jac Cunningham/i);
    expect(raw).not.toContain('"accountId": 1097');
    expect(raw).not.toContain("Demo Recreation");
  });
});
