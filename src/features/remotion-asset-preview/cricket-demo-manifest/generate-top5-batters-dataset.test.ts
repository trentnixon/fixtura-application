import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  TOP5_BATTERS_INNINGS,
  generateTop5BatterRows,
  PRESERVED_TOP5_BATTERS_FRAMES,
  PRESERVED_TOP5_BATTERS_TIMINGS,
  strikeRateFromRunsAndBalls,
} from "./generate-top5-batters-dataset";
import { loadCricketHistoricalDemoManifest } from "./index";

import type { buildSanitisedTop5BattersDataset } from "./generate-top5-batters-dataset";

const FILE_PATH = path.join(
  process.cwd(),
  "public/dummyAssetData/Cricket/Cricket_Top5Batters.json",
);
const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("generate-top5-batters-dataset", () => {
  it("recomputes strike rates and maps KnockOut 2000 players to countries", () => {
    expect(strikeRateFromRunsAndBalls(96, 82)).toBe(117.07);
    expect(strikeRateFromRunsAndBalls(78, 61)).toBe(127.87);

    const manifest = loadCricketHistoricalDemoManifest();
    const rows = generateTop5BatterRows(manifest);
    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.name)).toEqual(TOP5_BATTERS_INNINGS.map((row) => row.player));

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]!;
      const expected = TOP5_BATTERS_INNINGS[i]!;
      expect(row.runs).toBe(expected.runs);
      expect(row.balls).toBe(expected.balls);
      expect(row.notOut).toBe(expected.notOut);
      expect(row.SR).toBe(strikeRateFromRunsAndBalls(expected.runs, expected.balls));
      expect(row.prompt).toContain("fictional demonstration performance");
      expect(row.assignSponsors).toEqual({ competition: [], grade: [], team: [] });
      expect(row.primaryForScreen).toEqual([]);
      expect(row.playedFor.length).toBeGreaterThan(0);
      expect(row.teamLogo.url.startsWith("/dummyAssetData/flags/")).toBe(true);
    }
  });
});

describe("sanitised Cricket_Top5Batters.json", () => {
  it("preserves contract and removes local/production identities", () => {
    const raw = readFileSync(FILE_PATH, "utf8");
    const dataset = JSON.parse(raw) as ReturnType<typeof buildSanitisedTop5BattersDataset>;

    expect(dataset.data).toHaveLength(5);
    expect(dataset.frames).toEqual([...PRESERVED_TOP5_BATTERS_FRAMES]);
    expect(dataset.timings).toEqual(PRESERVED_TOP5_BATTERS_TIMINGS);
    expect(dataset.account.accountId).toBe(0);
    expect(typeof dataset.asset.assetsLinkID).toBe("string");

    for (const row of dataset.data) {
      const flagFile = path.join(FLAGS_DIR, path.basename(row.teamLogo.url));
      expect(existsSync(flagFile), `missing ${flagFile}`).toBe(true);
    }

    expect(raw).not.toMatch(/Epping|Sydney Shires|Craddock|fixtura\.s3|Balmain/i);
    expect(raw).not.toContain('"accountId": 439');
    expect(raw).not.toContain("Demo Recreation");
  });
});
