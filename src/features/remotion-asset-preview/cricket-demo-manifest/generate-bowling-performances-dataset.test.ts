import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  BOWLING_PERFORMANCES_COMPETITION,
  BOWLING_PERFORMANCES_GRADE,
  BOWLING_PERFORMANCES_POOL_ID,
  economyFromRunsAndOvers,
  generateBowlingPerformanceRows,
  generateFictionalBowlingSpell,
  legalDeliveriesFromOvers,
  PRESERVED_BOWLING_PERFORMANCES_FRAMES,
  PRESERVED_BOWLING_PERFORMANCES_TIMINGS,
} from "./generate-bowling-performances-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedBowlingPerformancesDataset } from "./generate-bowling-performances-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_BowlingPerformances.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-bowling-performances-dataset", () => {
  it("builds 12 seeded spells with legal overs and economy math", () => {
    expect(legalDeliveriesFromOvers("10")).toBe(60);
    expect(legalDeliveriesFromOvers("8.4")).toBe(52);
    expect(economyFromRunsAndOvers(52, "8.4")).toBe(6);

    const manifest = loadCricketHistoricalDemoManifest();
    const guidelines = manifest.syntheticGeneration.bowlingGuidelines as {
      wicketsRange: [number, number];
      runsConcededRange: [number, number];
      oversRange: [number, number];
    };
    const pool = manifest.playerPools.find((item) => item.id === BOWLING_PERFORMANCES_POOL_ID);
    expect(pool?.players).toHaveLength(12);

    const sample = generateFictionalBowlingSpell({
      seed: manifest.syntheticGeneration.seed,
      playerKey: "sample",
      wicketsRange: guidelines.wicketsRange,
      runsConcededRange: guidelines.runsConcededRange,
      oversRange: guidelines.oversRange,
    });
    expect(sample.wickets).toBeGreaterThanOrEqual(guidelines.wicketsRange[0]);
    expect(sample.wickets).toBeLessThanOrEqual(guidelines.wicketsRange[1]);
    expect(sample.runs).toBeGreaterThanOrEqual(guidelines.runsConcededRange[0]);
    expect(sample.runs).toBeLessThanOrEqual(guidelines.runsConcededRange[1]);
    expect(legalDeliveriesFromOvers(sample.overs)).toBeGreaterThan(0);

    const rows = generateBowlingPerformanceRows(manifest);
    expect(rows).toHaveLength(12);
    expect(rows.map((row) => row.name)).toEqual(pool!.players.map((player) => player.name));

    const nationIds = new Set(pool!.players.map((player) => player.nationId));
    expect(nationIds.size).toBe(12);

    for (const row of rows) {
      expect(typeof row.overs).toBe("string");
      expect(row.prompt).toContain("fictional demonstration performance");
      expect(row.prompt).toContain(
        `economy ${economyFromRunsAndOvers(row.runs, row.overs).toFixed(2)}`,
      );
      expect(row.assignSponsors.competition.name).toBe(BOWLING_PERFORMANCES_COMPETITION);
      expect(row.assignSponsors.grade.name).toBe(BOWLING_PERFORMANCES_GRADE);
      expect(row.playedFor).toBe(row.assignSponsors.Team.name);
      expect(row.teamLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
    }
  });
});

describe("sanitised Cricket_BowlingPerformances.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedBowlingPerformancesDataset>;

    expect(dataset.data).toHaveLength(12);
    expect(dataset.frames).toEqual([...PRESERVED_BOWLING_PERFORMANCES_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_BOWLING_PERFORMANCES_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const flagFile = path.join(FLAGS_DIR, path.basename(row.teamLogo.url));
      expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
      expect(typeof row.overs).toBe("string");
    }

    expect(raw).not.toMatch(/Runaway Bay|Helensvale|Gold Coast|Freddie Fowler|fixtura\.s3/i);
    expect(raw).not.toContain('"accountId": 430');
    expect(raw).not.toContain("Demo Recreation");
  });
});
