import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertManifestReferentialIntegrity,
  CRICKET_HISTORICAL_DEMO_MANIFEST_RELATIVE_PATH,
  loadCricketHistoricalDemoManifest,
} from "./index";

const ACTIVE_CRICKET_DATASET_FILES = [
  "Cricket_Ladder.json",
  "Cricket_upcoming.json",
  "Cricket_Top5Batters.json",
  "Cricket_Top5Bowlers.json",
  "Cricket_BattingPerformances.json",
  "Cricket_BowlingPerformances.json",
  "Cricket_Results.json",
  "Cricket_Roster.json",
  "Cricket_WeekendResultsSingle.json",
  "Cricket_TeamOfTheWeek.json",
] as const;

const FLAGS_DIR = path.join(process.cwd(), "public/dummyAssetData/flags");

describe("cricket historical demo manifest", () => {
  it("parses against the Zod schema and passes referential integrity checks", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    expect(() => assertManifestReferentialIntegrity(manifest)).not.toThrow();

    expect(manifest.nations.filter((nation) => nation.membership === "full")).toHaveLength(12);
    expect(manifest.nations.filter((nation) => nation.membership === "associate")).toHaveLength(5);
    expect(manifest.tournaments).toHaveLength(8);
    expect(manifest.stages).toHaveLength(8);
    expect(manifest.datasetBindings).toHaveLength(10);
    expect(manifest.syntheticGeneration.seed).toBe("fixtura-cricket-demo-v1");
    expect(manifest.flagAssets.requiredFiles).toContain("wi.svg");
  });

  it("covers every Full Member across ladder stages and player pools", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    const covered = new Set<string>();

    for (const stage of manifest.stages) {
      for (const nationId of stage.participantNationIds) {
        covered.add(nationId);
      }
    }
    for (const pool of manifest.playerPools) {
      for (const player of pool.players) {
        covered.add(player.nationId);
      }
    }

    for (const nation of manifest.nations.filter((entry) => entry.membership === "full")) {
      expect(covered.has(nation.id), `${nation.displayName} missing from suite coverage`).toBe(
        true,
      );
    }
  });

  it("keeps historical nodes separate from synthetic generation rules", () => {
    const manifest = loadCricketHistoricalDemoManifest();
    expect(manifest.tournaments.every((tournament) => tournament.kind === "historical")).toBe(true);
    expect(manifest.fixtures.every((fixture) => fixture.kind === "historical")).toBe(true);
    expect(manifest.playerPools.every((pool) => pool.kind === "historical")).toBe(true);
    expect(manifest.syntheticGeneration.kind).toBe("synthetic-rules");
    expect(manifest.syntheticGeneration.candidateExamples.isSynthetic).toBe(true);
  });

  it("has sanitised all active Remotion cricket dataset files", () => {
    const remaining = ACTIVE_CRICKET_DATASET_FILES.filter(
      (fileName) =>
        fileName !== "Cricket_Ladder.json" &&
        fileName !== "Cricket_upcoming.json" &&
        fileName !== "Cricket_Top5Batters.json" &&
        fileName !== "Cricket_Top5Bowlers.json" &&
        fileName !== "Cricket_BattingPerformances.json" &&
        fileName !== "Cricket_BowlingPerformances.json" &&
        fileName !== "Cricket_Results.json" &&
        fileName !== "Cricket_Roster.json" &&
        fileName !== "Cricket_WeekendResultsSingle.json" &&
        fileName !== "Cricket_TeamOfTheWeek.json",
    );
    expect(remaining).toEqual([]);
    for (const fileName of ACTIVE_CRICKET_DATASET_FILES) {
      const absolutePath = path.join(process.cwd(), "public/dummyAssetData/Cricket", fileName);
      const raw = readFileSync(absolutePath, "utf8");
      expect(raw).not.toMatch(/fixtura\.s3|Sydney Shires|Goulburn|Runaway Bay/i);
    }

    const manifestPath = path.join(process.cwd(), CRICKET_HISTORICAL_DEMO_MANIFEST_RELATIVE_PATH);
    expect(readFileSync(manifestPath, "utf8").length).toBeGreaterThan(1000);
  });

  it("vendors all required flag SVGs including resolved West Indies exception", () => {
    const manifest = loadCricketHistoricalDemoManifest();

    expect(manifest.flagAssets.requiredFiles).toHaveLength(17);
    expect(existsSync(path.join(FLAGS_DIR, "LICENSE"))).toBe(true);
    expect(existsSync(path.join(FLAGS_DIR, "ATTRIBUTION.md"))).toBe(true);

    for (const fileName of manifest.flagAssets.requiredFiles) {
      const absolutePath = path.join(FLAGS_DIR, fileName);
      expect(existsSync(absolutePath), `missing flag ${fileName}`).toBe(true);
      const svg = readFileSync(absolutePath, "utf8");
      expect(svg.length).toBeGreaterThan(0);
      expect(svg).toMatch(/<svg\b/i);
      expect(svg).toMatch(/viewBox=/i);
    }

    const westIndies = manifest.nations.find((nation) => nation.id === "wi");
    expect(westIndies?.isIsoCountry).toBe(false);
    expect(westIndies?.visualAssetException?.status).toBe("resolved");
    expect(manifest.flagAssets.westIndiesException.status).toBe("resolved");
    expect(manifest.flagAssets.westIndiesException.sourceUrl).toContain(
      "WestIndiesCricketFlagPre1999",
    );
  });
});
