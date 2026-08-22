import { createSeededRng, sanitiseLadderVideoMeta } from "./generate-ladder-dataset";
import { strikeRateFromRunsAndBalls } from "./generate-top5-batters-dataset";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_BATTING_PERFORMANCES_FRAMES = [45, 180, 345, 510, 645] as const;

export const PRESERVED_BATTING_PERFORMANCES_TIMINGS = {
  FPS_MAIN: 510,
  FPS_INTRO: 90,
  FPS_OUTRO: 90,
  FPS_LADDER: 0,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 180,
} as const;

export const BATTING_PERFORMANCES_COMPETITION = "2007 Cricket World Cup";
export const BATTING_PERFORMANCES_GRADE = "ODI / Super Eight";
export const BATTING_PERFORMANCES_POOL_ID = "pool-cwc-2007-batters";
export const BATTING_PERFORMANCES_TOURNAMENT_ID = "cwc-2007";

export const BATTING_PERFORMANCES_VENUE_IDS = [
  "kensington-oval",
  "sabina-park",
  "sir-vivian-richards",
  "providence",
  "queens-park-oval",
  "beausejour",
] as const;

export type BattingPerformanceRow = {
  SR: number;
  name: string;
  runs: number;
  balls: number;
  notOut: boolean;
  prompt: string;
  teamLogo: { url: string; width: number; height: number };
  playedFor: string;
  assignSponsors: {
    competition: [];
    grade: [];
    team: [];
  };
  primaryForScreen: [];
};

export type GeneratedInnings = {
  runs: number;
  balls: number;
  notOut: boolean;
  SR: number;
};

export function generateFictionalInnings(args: {
  seed: string;
  playerKey: string;
  runsRange: readonly [number, number];
  ballsRange: readonly [number, number];
  strikeRateRange: readonly [number, number];
}): GeneratedInnings {
  const rng = createSeededRng(`${args.seed}::batting-performances::${args.playerKey}`);
  const [minRuns, maxRuns] = args.runsRange;
  const [minBalls, maxBalls] = args.ballsRange;
  const [minSr, maxSr] = args.strikeRateRange;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const runs = minRuns + Math.floor(rng() * (maxRuns - minRuns + 1));
    const ballsLow = Math.max(minBalls, Math.ceil((runs * 100) / maxSr));
    const ballsHigh = Math.min(maxBalls, Math.floor((runs * 100) / minSr));
    if (ballsLow > ballsHigh) {
      continue;
    }
    const balls = ballsLow + Math.floor(rng() * (ballsHigh - ballsLow + 1));
    const SR = strikeRateFromRunsAndBalls(runs, balls);
    if (SR < minSr || SR > maxSr) {
      continue;
    }
    return {
      runs,
      balls,
      notOut: rng() < 0.3,
      SR,
    };
  }

  throw new Error(`Unable to generate valid fictional innings for ${args.playerKey}`);
}

export function generateBattingPerformanceRows(
  manifest: CricketHistoricalDemoManifest,
): BattingPerformanceRow[] {
  const pool = manifest.playerPools.find((item) => item.id === BATTING_PERFORMANCES_POOL_ID);
  if (!pool) {
    throw new Error(`Missing player pool ${BATTING_PERFORMANCES_POOL_ID}`);
  }
  if (pool.players.length !== 19) {
    throw new Error(`Expected 19 batting performances, got ${pool.players.length}`);
  }

  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const venuesById = new Map(manifest.venues.map((venue) => [venue.id, venue]));
  const venues = BATTING_PERFORMANCES_VENUE_IDS.map((venueId) => {
    const venue = venuesById.get(venueId);
    if (!venue) {
      throw new Error(`Missing venue context ${venueId}`);
    }
    return venue;
  });

  const guidelines = manifest.syntheticGeneration.battingGuidelines as {
    runsRange: [number, number];
    ballsRange: [number, number];
    strikeRateRange: [number, number];
  };
  const seed = manifest.syntheticGeneration.seed;

  return pool.players.map((player, index) => {
    const nation = nationsById.get(player.nationId);
    if (!nation) {
      throw new Error(`Unknown nation ${player.nationId} for ${player.name}`);
    }

    const innings = generateFictionalInnings({
      seed,
      playerKey: `${index}:${player.name}`,
      runsRange: guidelines.runsRange,
      ballsRange: guidelines.ballsRange,
      strikeRateRange: guidelines.strikeRateRange,
    });

    const venue = venues[index % venues.length]!;
    const dismissal = innings.notOut ? "not out" : "dismissed";
    const prompt = [
      `${player.name} played for ${nation.displayName}, scoring ${innings.runs} runs from ${innings.balls} balls`,
      `with a strike rate of ${innings.SR.toFixed(2)} (${dismissal}).`,
      `Venue context: ${venue.displayName}.`,
      `Competition: ${BATTING_PERFORMANCES_COMPETITION}. Grade: ${BATTING_PERFORMANCES_GRADE}.`,
      "This is a fictional demonstration performance for archive preview only.",
    ].join(" ");

    return {
      SR: innings.SR,
      name: player.name,
      runs: innings.runs,
      balls: innings.balls,
      notOut: innings.notOut,
      prompt,
      teamLogo: {
        url: nation.flagPath,
        width: 640,
        height: 480,
      },
      playedFor: nation.displayName,
      assignSponsors: {
        competition: [],
        grade: [],
        team: [],
      },
      primaryForScreen: [],
    };
  });
}

export function sanitiseBattingPerformancesVideoMeta(
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

export function buildSanitisedBattingPerformancesDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: BattingPerformanceRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_BATTING_PERFORMANCES_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateBattingPerformanceRows(args.manifest);
  if (data.length !== 19) {
    throw new Error(`Expected 19 batting performances, got ${data.length}`);
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
    timings: { ...PRESERVED_BATTING_PERFORMANCES_TIMINGS },
    frames: [...PRESERVED_BATTING_PERFORMANCES_FRAMES],
    videoMeta: sanitiseBattingPerformancesVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
