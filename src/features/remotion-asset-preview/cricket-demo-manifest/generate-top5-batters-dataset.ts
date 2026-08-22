import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";

import {
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_TOP5_BATTERS_FRAMES = [390, 45] as const;

export const PRESERVED_TOP5_BATTERS_TIMINGS = {
  FPS_MAIN: 360,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 0,
} as const;

export const TOP5_BATTERS_COMPETITION = "ICC KnockOut Kenya 2000";
export const TOP5_BATTERS_GRADE = "ODI / Knockout Stage";

/** Canonical fictional innings from the implementation brief / manifest candidates. */
export const TOP5_BATTERS_INNINGS = [
  { player: "Sourav Ganguly", nationId: "ind", runs: 96, balls: 82, notOut: false },
  { player: "Chris Cairns", nationId: "nz", runs: 78, balls: 61, notOut: true },
  { player: "Sachin Tendulkar", nationId: "ind", runs: 74, balls: 59, notOut: false },
  { player: "Jacques Kallis", nationId: "sa", runs: 68, balls: 75, notOut: false },
  { player: "Sanath Jayasuriya", nationId: "sl", runs: 62, balls: 44, notOut: false },
] as const;

export type Top5BatterRow = {
  SR: number;
  name: string;
  runs: number;
  balls: number;
  notOut: boolean;
  prompt: string;
  teamLogo: { url: string; width: number; height: number };
  playedFor: string;
} & DemoContentRowSponsorFields;

export function strikeRateFromRunsAndBalls(runs: number, balls: number): number {
  if (balls <= 0) {
    throw new Error("balls must be positive");
  }
  return Number(((runs / balls) * 100).toFixed(2));
}

export function generateTop5BatterRows(manifest: CricketHistoricalDemoManifest): Top5BatterRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));

  return TOP5_BATTERS_INNINGS.map((innings) => {
    const nation = nationsById.get(innings.nationId);
    if (!nation) {
      throw new Error(`Unknown nation ${innings.nationId} for ${innings.player}`);
    }

    const sr = strikeRateFromRunsAndBalls(innings.runs, innings.balls);
    const dismissal = innings.notOut ? "not out" : "dismissed";
    const prompt = [
      `${innings.player} played for ${nation.displayName}, scoring ${innings.runs} runs from ${innings.balls} balls`,
      `with a strike rate of ${sr.toFixed(2)} (${dismissal}).`,
      `Competition: ${TOP5_BATTERS_COMPETITION}. Grade: ${TOP5_BATTERS_GRADE}.`,
      "This is a fictional demonstration performance for archive preview only.",
    ].join(" ");

    return {
      SR: sr,
      name: innings.player,
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
      ...emptyDemoContentRowSponsorFields(),
    };
  });
}

export function sanitiseTop5BattersVideoMeta(
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

export function buildSanitisedTop5BattersDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: Top5BatterRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_TOP5_BATTERS_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateTop5BatterRows(args.manifest);
  if (data.length !== 5) {
    throw new Error(`Expected 5 top batters, got ${data.length}`);
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
    timings: { ...PRESERVED_TOP5_BATTERS_TIMINGS },
    frames: [...PRESERVED_TOP5_BATTERS_FRAMES],
    videoMeta: sanitiseTop5BattersVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
