import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  ACTIVE_CRICKET_DEMO_FILES,
  COMPOSITION_CONTRACTS,
  FORBIDDEN_PRIVACY_PATTERNS,
  REQUIRED_FLAG_FILES,
  assertBattingStatConsistency,
  assertBowlingStatConsistency,
  assertCompositionMappingMatchesRemotionConstants,
  assertDatasetContract,
  assertLadderRowIdentity,
  assertLocalDummyAssetExists,
  collectDummyAssetPaths,
  cricketDatasetAbsolutePath,
  economyFromRunsAndOvers,
  legalDeliveriesFromOvers,
  loadActiveCricketDataset,
  scanDatasetPrivacy,
  strikeRateFromRunsAndBalls,
} from "./cricket-demo-dataset-validators";

const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("cricket demo composition contracts", () => {
  it("maps every Remotion composition to the expected public JSON path", () => {
    expect(() => assertCompositionMappingMatchesRemotionConstants()).not.toThrow();
    expect(COMPOSITION_CONTRACTS).toHaveLength(10);
    expect(ACTIVE_CRICKET_DEMO_FILES).toHaveLength(10);
  });

  it("preserves data length, frames and timings for all ten active datasets", () => {
    for (const contract of COMPOSITION_CONTRACTS) {
      const dataset = loadActiveCricketDataset(contract.fileName);
      expect(() => assertDatasetContract(contract.fileName, dataset)).not.toThrow();
      expect(dataset.videoMeta).toBeTruthy();
      expect(dataset.asset).toBeTruthy();
    }
  });
});

describe("cricket demo privacy scan", () => {
  it("finds zero forbidden local/production identities across active datasets", () => {
    const allHits: string[] = [];
    for (const fileName of ACTIVE_CRICKET_DEMO_FILES) {
      const absolutePath = cricketDatasetAbsolutePath(fileName);
      const raw = readFileSync(absolutePath, "utf8");
      const dataset = loadActiveCricketDataset(fileName);
      allHits.push(...scanDatasetPrivacy(fileName, dataset, raw));
    }
    expect(allHits).toEqual([]);
  });

  it("still matches known dirty seeds (guard against accidental allowlisting)", () => {
    const dirty =
      "Sydney Shires Competition and fixtura.s3.ap-southeast-2.amazonaws.com accountId: 439";
    expect(FORBIDDEN_PRIVACY_PATTERNS.some((pattern) => pattern.test(dirty))).toBe(true);
  });
});

describe("cricket demo local asset paths", () => {
  it("requires all 17 flag files on disk", () => {
    expect(REQUIRED_FLAG_FILES).toHaveLength(17);
    for (const fileName of REQUIRED_FLAG_FILES) {
      expect(existsSync(path.join(FLAGS_DIR, fileName)), `missing ${fileName}`).toBe(true);
      const svg = readFileSync(path.join(FLAGS_DIR, fileName), "utf8");
      expect(svg).toMatch(/viewBox=/i);
    }
  });

  it("resolves every /dummyAssetData path referenced by active datasets", () => {
    for (const fileName of ACTIVE_CRICKET_DEMO_FILES) {
      const dataset = loadActiveCricketDataset(fileName);
      for (const assetPath of collectDummyAssetPaths(dataset)) {
        expect(() => assertLocalDummyAssetExists(assetPath)).not.toThrow();
      }
    }
  });
});

describe("cricket-stat consistency helpers", () => {
  it("accepts valid batting/bowling/ladder math and rejects intentional failures", () => {
    expect(strikeRateFromRunsAndBalls(96, 82)).toBe(117.07);
    expect(legalDeliveriesFromOvers("8.4")).toBe(52);
    expect(economyFromRunsAndOvers(52, "8.4")).toBe(6);

    expect(() =>
      assertBattingStatConsistency({ runs: 96, balls: 82, fours: 7, sixes: 1, sr: 117.07 }),
    ).not.toThrow();
    expect(() =>
      assertBattingStatConsistency({ runs: 20, balls: 10, fours: 6, sixes: 0, sr: 200 }),
    ).toThrow(/boundaries exceed runs/);
    expect(() => assertBattingStatConsistency({ runs: 96, balls: 82, sr: 100 })).toThrow(/SR/);

    expect(() =>
      assertBowlingStatConsistency({ runs: 36, overs: "10", economy: "3.60" }),
    ).not.toThrow();
    expect(() => assertBowlingStatConsistency({ runs: 36, overs: "8.4", economy: "4.5" })).toThrow(
      /economy/,
    );
    expect(() => legalDeliveriesFromOvers("8.6")).toThrow(/Invalid overs/);

    expect(() =>
      assertLadderRowIdentity({ played: 5, wins: 3, losses: 1, ties: 1, noResult: 0, points: 7 }),
    ).not.toThrow();
    expect(() =>
      assertLadderRowIdentity({ played: 5, wins: 3, losses: 1, ties: 0, noResult: 0, points: 7 }),
    ).toThrow(/P /);
  });
});
