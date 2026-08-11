/**
 * Shared Remotion cricket demo dataset contracts + privacy/path/stat validators.
 * Cross-cutting acceptance for the sanitisation feature close-out.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { REMOTION_SANDBOX_CRICKET_DATASET_PATHS } from "@/components/remotion/_constants/remotion-datasets";

import {
  PRESERVED_BATTING_PERFORMANCES_FRAMES,
  PRESERVED_BATTING_PERFORMANCES_TIMINGS,
} from "./generate-batting-performances-dataset";
import {
  PRESERVED_BOWLING_PERFORMANCES_FRAMES,
  PRESERVED_BOWLING_PERFORMANCES_TIMINGS,
} from "./generate-bowling-performances-dataset";
import {
  economyFromRunsAndOvers,
  legalDeliveriesFromOvers,
} from "./generate-bowling-performances-dataset";
import {
  PRESERVED_LADDER_FRAMES,
  PRESERVED_LADDER_TIMINGS,
  playedFromParts,
  pointsFromParts,
} from "./generate-ladder-dataset";
import { PRESERVED_RESULTS_FRAMES, PRESERVED_RESULTS_TIMINGS } from "./generate-results-dataset";
import { PRESERVED_ROSTER_FRAMES, PRESERVED_ROSTER_TIMINGS } from "./generate-roster-dataset";
import {
  PRESERVED_TEAM_OF_THE_WEEK_FRAMES,
  PRESERVED_TEAM_OF_THE_WEEK_TIMINGS,
} from "./generate-team-of-the-week-dataset";
import {
  PRESERVED_TOP5_BATTERS_FRAMES,
  PRESERVED_TOP5_BATTERS_TIMINGS,
  strikeRateFromRunsAndBalls,
} from "./generate-top5-batters-dataset";
import {
  PRESERVED_TOP5_BOWLERS_FRAMES,
  PRESERVED_TOP5_BOWLERS_TIMINGS,
} from "./generate-top5-bowlers-dataset";
import { PRESERVED_UPCOMING_FRAMES, PRESERVED_UPCOMING_TIMINGS } from "./generate-upcoming-dataset";
import {
  PRESERVED_WEEKEND_RESULTS_FRAMES,
  PRESERVED_WEEKEND_RESULTS_TIMINGS,
} from "./generate-weekend-results-dataset";

export const ACTIVE_CRICKET_DEMO_FILES = [
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

export const COMPOSITION_CONTRACTS = [
  {
    compositionId: "CricketLadder",
    fileName: "Cricket_Ladder.json",
    dataLength: 8,
    frames: PRESERVED_LADDER_FRAMES,
    timings: PRESERVED_LADDER_TIMINGS,
  },
  {
    compositionId: "CricketUpcoming",
    fileName: "Cricket_upcoming.json",
    dataLength: 6,
    frames: PRESERVED_UPCOMING_FRAMES,
    timings: PRESERVED_UPCOMING_TIMINGS,
  },
  {
    compositionId: "CricketTop5Batting",
    fileName: "Cricket_Top5Batters.json",
    dataLength: 5,
    frames: PRESERVED_TOP5_BATTERS_FRAMES,
    timings: PRESERVED_TOP5_BATTERS_TIMINGS,
  },
  {
    compositionId: "CricketTop5Bowling",
    fileName: "Cricket_Top5Bowlers.json",
    dataLength: 5,
    frames: PRESERVED_TOP5_BOWLERS_FRAMES,
    timings: PRESERVED_TOP5_BOWLERS_TIMINGS,
  },
  {
    compositionId: "CricketBattingPerformances",
    fileName: "Cricket_BattingPerformances.json",
    dataLength: 19,
    frames: PRESERVED_BATTING_PERFORMANCES_FRAMES,
    timings: PRESERVED_BATTING_PERFORMANCES_TIMINGS,
  },
  {
    compositionId: "CricketBowlingPerformances",
    fileName: "Cricket_BowlingPerformances.json",
    dataLength: 12,
    frames: PRESERVED_BOWLING_PERFORMANCES_FRAMES,
    timings: PRESERVED_BOWLING_PERFORMANCES_TIMINGS,
  },
  {
    compositionId: "CricketResults",
    fileName: "Cricket_Results.json",
    dataLength: 4,
    frames: PRESERVED_RESULTS_FRAMES,
    timings: PRESERVED_RESULTS_TIMINGS,
  },
  {
    compositionId: "CricketRoster",
    fileName: "Cricket_Roster.json",
    dataLength: 11,
    frames: PRESERVED_ROSTER_FRAMES,
    timings: PRESERVED_ROSTER_TIMINGS,
  },
  {
    compositionId: "CricketResultSingle",
    fileName: "Cricket_WeekendResultsSingle.json",
    dataLength: 9,
    frames: PRESERVED_WEEKEND_RESULTS_FRAMES,
    timings: PRESERVED_WEEKEND_RESULTS_TIMINGS,
  },
  {
    compositionId: "CricketTeamOfTheWeek",
    fileName: "Cricket_TeamOfTheWeek.json",
    dataLength: 12,
    frames: PRESERVED_TEAM_OF_THE_WEEK_FRAMES,
    timings: PRESERVED_TEAM_OF_THE_WEEK_TIMINGS,
  },
] as const;

export const REQUIRED_FLAG_FILES = [
  "af.svg",
  "au.svg",
  "bd.svg",
  "gb-eng.svg",
  "in.svg",
  "ie.svg",
  "nz.svg",
  "pk.svg",
  "za.svg",
  "lk.svg",
  "wi.svg",
  "zw.svg",
  "ke.svg",
  "nl.svg",
  "ae.svg",
  "gb-sct.svg",
  "na.svg",
] as const;

/** Reviewed forbidden residual local/production seeds for privacy scanning. */
export const FORBIDDEN_PRIVACY_PATTERNS: RegExp[] = [
  /Runaway Bay/i,
  /\bCGC\b/,
  /Cricket Gold Coast/i,
  /Goulburn District Cricket Association/i,
  /Sydney Shires Competition/i,
  /Strathmore Heights/i,
  /Western Suburbs Cricket Club/i,
  /\bWSCC\b/,
  /\bSJCC\b/,
  /MadBulls/i,
  /fixtura\.s3/i,
  /lmssocialmediamanager\.s3/i,
  /res\.cloudinary\.com\/playhq/i,
  /"accountId"\s*:\s*(430|1097|439|195|470)\b/,
  /accountBias/i,
  /Kreative Property/i,
  /Canacord Genuity/i,
  /Hola Health/i,
  /Prestige Liquor/i,
  /Frank Dowling/i,
  /No players allocated to line-up/i,
];

export type DatasetEnvelope = {
  data: unknown[];
  frames: number[];
  timings: Record<string, number>;
  account?: { accountId?: number };
  asset?: Record<string, unknown>;
  videoMeta?: Record<string, unknown>;
};

export function cricketDatasetAbsolutePath(fileName: string, cwd = process.cwd()): string {
  return path.join(cwd, "public/dummyAssetData/Cricket", fileName);
}

export function loadActiveCricketDataset(fileName: string, cwd = process.cwd()): DatasetEnvelope {
  const absolutePath = cricketDatasetAbsolutePath(fileName, cwd);
  return JSON.parse(readFileSync(absolutePath, "utf8")) as DatasetEnvelope;
}

export function assertCompositionMappingMatchesRemotionConstants(): void {
  for (const contract of COMPOSITION_CONTRACTS) {
    const mapped =
      REMOTION_SANDBOX_CRICKET_DATASET_PATHS[
        contract.compositionId as keyof typeof REMOTION_SANDBOX_CRICKET_DATASET_PATHS
      ];
    if (mapped !== `/dummyAssetData/Cricket/${contract.fileName}`) {
      throw new Error(
        `Mapping mismatch for ${contract.compositionId}: expected /dummyAssetData/Cricket/${contract.fileName}, got ${mapped}`,
      );
    }
  }
}

export function assertDatasetContract(fileName: string, dataset: DatasetEnvelope): void {
  const contract = COMPOSITION_CONTRACTS.find((item) => item.fileName === fileName);
  if (!contract) {
    throw new Error(`No contract for ${fileName}`);
  }
  if (!Array.isArray(dataset.data) || dataset.data.length !== contract.dataLength) {
    throw new Error(
      `${fileName}: expected data length ${contract.dataLength}, got ${dataset.data?.length}`,
    );
  }
  if (JSON.stringify(dataset.frames) !== JSON.stringify([...contract.frames])) {
    throw new Error(`${fileName}: frames mismatch`);
  }
  for (const [key, value] of Object.entries(contract.timings)) {
    if (dataset.timings?.[key] !== value) {
      throw new Error(
        `${fileName}: timings.${key} expected ${value}, got ${dataset.timings?.[key]}`,
      );
    }
  }
  if (dataset.account?.accountId !== 0) {
    throw new Error(`${fileName}: account.accountId must be 0`);
  }
}

export function collectScalarStrings(
  value: unknown,
  pathParts: string[] = [],
): Array<{ path: string; value: string }> {
  if (typeof value === "string") {
    return [{ path: pathParts.join(".") || "$", value }];
  }
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectScalarStrings(item, [...pathParts, String(index)]),
    );
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      collectScalarStrings(child, [...pathParts, key]),
    );
  }
  return [];
}

export function scanDatasetPrivacy(
  fileName: string,
  dataset: DatasetEnvelope,
  raw: string,
): string[] {
  const hits: string[] = [];
  for (const pattern of FORBIDDEN_PRIVACY_PATTERNS) {
    if (pattern.test(raw)) {
      hits.push(`${fileName} raw text matched ${String(pattern)}`);
    }
  }
  for (const entry of collectScalarStrings(dataset)) {
    for (const pattern of FORBIDDEN_PRIVACY_PATTERNS) {
      if (pattern.test(entry.value)) {
        hits.push(`${fileName} ${entry.path} matched ${String(pattern)}`);
      }
    }
    // Also scan JSON-string prompts as parsed objects when possible.
    if (entry.value.trim().startsWith("{") || entry.value.trim().startsWith("[")) {
      try {
        const nested = JSON.parse(entry.value) as unknown;
        for (const nestedEntry of collectScalarStrings(nested, [entry.path, "<parsed>"])) {
          for (const pattern of FORBIDDEN_PRIVACY_PATTERNS) {
            if (pattern.test(nestedEntry.value)) {
              hits.push(`${fileName} ${nestedEntry.path} matched ${String(pattern)}`);
            }
          }
        }
      } catch {
        // Not JSON — ignore.
      }
    }
  }
  return hits;
}

export function collectDummyAssetPaths(value: unknown): string[] {
  const paths: string[] = [];
  for (const entry of collectScalarStrings(value)) {
    if (entry.value.startsWith("/dummyAssetData/")) {
      paths.push(entry.value);
    }
  }
  return paths;
}

export function assertLocalDummyAssetExists(assetPath: string, cwd = process.cwd()): void {
  const absolute = path.join(cwd, "public", assetPath.replace(/^\//, ""));
  if (!existsSync(absolute)) {
    throw new Error(`Missing local asset for ${assetPath} (expected ${absolute})`);
  }
}

export function assertBattingStatConsistency(args: {
  runs: number;
  balls: number;
  fours?: number;
  sixes?: number;
  sr?: number;
  path?: string;
}): void {
  const label = args.path ?? "batting";
  if (args.runs < 0 || args.balls < 0) {
    throw new Error(`${label}: runs/balls must be non-negative`);
  }
  if (args.balls > 0 && args.sr !== undefined) {
    const expected = strikeRateFromRunsAndBalls(args.runs, args.balls);
    if (args.sr !== expected) {
      throw new Error(`${label}: SR ${args.sr} !== ${expected}`);
    }
  }
  if (args.fours !== undefined && args.sixes !== undefined) {
    if (args.fours * 4 + args.sixes * 6 > args.runs) {
      throw new Error(`${label}: boundaries exceed runs`);
    }
  }
}

export function assertBowlingStatConsistency(args: {
  runs: number;
  overs: string | number;
  economy?: string | number;
  path?: string;
}): void {
  const label = args.path ?? "bowling";
  const oversText = String(args.overs);
  const deliveries = legalDeliveriesFromOvers(oversText);
  if (deliveries <= 0) {
    throw new Error(`${label}: overs must include legal deliveries`);
  }
  if (args.economy !== undefined) {
    const expected = economyFromRunsAndOvers(args.runs, oversText);
    const actual = Number(args.economy);
    if (actual !== expected) {
      throw new Error(`${label}: economy ${actual} !== ${expected}`);
    }
  }
}

export function assertLadderRowIdentity(args: {
  played: number;
  wins: number;
  losses: number;
  ties: number;
  noResult: number;
  points: number;
  path?: string;
}): void {
  const label = args.path ?? "ladder";
  const expectedPlayed = playedFromParts(args.wins, args.losses, args.ties, args.noResult);
  const expectedPoints = pointsFromParts(args.wins, args.ties, args.noResult);
  if (args.played !== expectedPlayed) {
    throw new Error(`${label}: P ${args.played} !== ${expectedPlayed}`);
  }
  if (args.points !== expectedPoints) {
    throw new Error(`${label}: PTS ${args.points} !== ${expectedPoints}`);
  }
}

export {
  legalDeliveriesFromOvers,
  economyFromRunsAndOvers,
  strikeRateFromRunsAndBalls,
  playedFromParts,
  pointsFromParts,
};
