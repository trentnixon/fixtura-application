import { createSeededRng, sanitiseLadderVideoMeta } from "./generate-ladder-dataset";

import {
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_BOWLING_PERFORMANCES_FRAMES = [45, 180, 345, 510] as const;

export const PRESERVED_BOWLING_PERFORMANCES_TIMINGS = {
  FPS_MAIN: 510,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 180,
} as const;

export const BOWLING_PERFORMANCES_COMPETITION = "2015 Cricket World Cup";
export const BOWLING_PERFORMANCES_GRADE = "ODI / Pool Stage";
export const BOWLING_PERFORMANCES_POOL_ID = "pool-cwc-2015-bowlers";

export type BowlingPerformanceRow = {
  name: string;
  runs: number;
  overs: string;
  prompt: string;
  wickets: number;
  teamLogo: { url: string; width: number; height: number };
  playedFor: string;
} & DemoContentRowSponsorFields;

export type GeneratedSpell = {
  wickets: number;
  runs: number;
  overs: string;
};

/** Convert cricket overs notation (e.g. "8.4") into legal deliveries. */
export function legalDeliveriesFromOvers(overs: string): number {
  const match = /^(\d+)(?:\.([1-5]))?$/.exec(overs.trim());
  if (!match) {
    throw new Error(`Invalid overs notation: ${overs}`);
  }
  const completedOvers = Number(match[1]);
  const balls = match[2] ? Number(match[2]) : 0;
  return completedOvers * 6 + balls;
}

export function economyFromRunsAndOvers(runs: number, overs: string): number {
  const deliveries = legalDeliveriesFromOvers(overs);
  if (deliveries <= 0) {
    throw new Error("overs must include at least one legal delivery");
  }
  return Number(((runs / deliveries) * 6).toFixed(2));
}

export function formatOversNotation(completedOvers: number, balls: number): string {
  if (balls < 0 || balls > 5) {
    throw new Error(`Invalid balls in overs: ${balls}`);
  }
  return balls === 0 ? String(completedOvers) : `${completedOvers}.${balls}`;
}

export function generateFictionalBowlingSpell(args: {
  seed: string;
  playerKey: string;
  wicketsRange: readonly [number, number];
  runsConcededRange: readonly [number, number];
  oversRange: readonly [number, number];
}): GeneratedSpell {
  const rng = createSeededRng(`${args.seed}::bowling-performances::${args.playerKey}`);
  const [minWickets, maxWickets] = args.wicketsRange;
  const [minRuns, maxRuns] = args.runsConcededRange;
  const [minOvers, maxOvers] = args.oversRange;

  const wickets = minWickets + Math.floor(rng() * (maxWickets - minWickets + 1));
  const runs = minRuns + Math.floor(rng() * (maxRuns - minRuns + 1));

  // Prefer completed overs; occasionally emit a legal partial over (X.1–X.5).
  const completedOvers = minOvers + Math.floor(rng() * (maxOvers - minOvers + 1));
  const usePartial = completedOvers < maxOvers && rng() < 0.35;
  const balls = usePartial ? 1 + Math.floor(rng() * 5) : 0;
  const overs = formatOversNotation(completedOvers, balls);

  return { wickets, runs, overs };
}

export function generateBowlingPerformanceRows(
  manifest: CricketHistoricalDemoManifest,
): BowlingPerformanceRow[] {
  const pool = manifest.playerPools.find((item) => item.id === BOWLING_PERFORMANCES_POOL_ID);
  if (!pool) {
    throw new Error(`Missing player pool ${BOWLING_PERFORMANCES_POOL_ID}`);
  }
  if (pool.players.length !== 12) {
    throw new Error(`Expected 12 bowling performances, got ${pool.players.length}`);
  }

  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const guidelines = manifest.syntheticGeneration.bowlingGuidelines as {
    wicketsRange: [number, number];
    runsConcededRange: [number, number];
    oversRange: [number, number];
  };
  const seed = manifest.syntheticGeneration.seed;

  return pool.players.map((player, index) => {
    const nation = nationsById.get(player.nationId);
    if (!nation) {
      throw new Error(`Unknown nation ${player.nationId} for ${player.name}`);
    }

    const spell = generateFictionalBowlingSpell({
      seed,
      playerKey: `${index}:${player.name}`,
      wicketsRange: guidelines.wicketsRange,
      runsConcededRange: guidelines.runsConcededRange,
      oversRange: guidelines.oversRange,
    });

    const economy = economyFromRunsAndOvers(spell.runs, spell.overs);
    const prompt = [
      `${player.name} played for ${nation.displayName}, taking ${spell.wickets} wickets`,
      `from ${spell.overs} overs, conceding ${spell.runs} runs`,
      `(economy ${economy.toFixed(2)}).`,
      `Competition: ${BOWLING_PERFORMANCES_COMPETITION}. Grade: ${BOWLING_PERFORMANCES_GRADE}.`,
      "This is a fictional demonstration performance for archive preview only.",
    ].join(" ");

    return {
      name: player.name,
      runs: spell.runs,
      overs: spell.overs,
      prompt,
      wickets: spell.wickets,
      teamLogo: {
        url: nation.flagPath,
        width: 640,
        height: 480,
      },
      playedFor: nation.displayName,
      ...emptyDemoContentRowSponsorFields(),
    };
  });
}

export function sanitiseBowlingPerformancesVideoMeta(
  videoMeta: Record<string, unknown>,
): Record<string, unknown> {
  const clone = sanitiseLadderVideoMeta(videoMeta) as {
    video: {
      fixtureCategory?: string;
      groupingCategory?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  clone.video.fixtureCategory = "International Cricket Demo Preview";
  clone.video.groupingCategory = "International Cricket Demo Preview";
  return clone;
}

export function buildSanitisedBowlingPerformancesDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: BowlingPerformanceRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_BOWLING_PERFORMANCES_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateBowlingPerformanceRows(args.manifest);
  if (data.length !== 12) {
    throw new Error(`Expected 12 bowling performances, got ${data.length}`);
  }

  return {
    data,
    asset: {
      assetID: 0,
      assetTypeID: 0,
      assetCategoryID: 0,
      assetsLinkID: "",
    },
    render: {
      schedulerId: 0,
      renderId: 0,
    },
    account: {
      accountId: 0,
    },
    timings: { ...PRESERVED_BOWLING_PERFORMANCES_TIMINGS },
    frames: [...PRESERVED_BOWLING_PERFORMANCES_FRAMES],
    videoMeta: sanitiseBowlingPerformancesVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
