import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";

import {
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_TOP5_BOWLERS_FRAMES = [390, 45] as const;

export const PRESERVED_TOP5_BOWLERS_TIMINGS = {
  FPS_MAIN: 360,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 0,
} as const;

export const TOP5_BOWLERS_COMPETITION = "ICC KnockOut Kenya 2000";
export const TOP5_BOWLERS_GRADE = "ODI / Knockout Stage";

/** Canonical fictional spells from the implementation brief / manifest candidates. */
export const TOP5_BOWLERS_SPELLS = [
  { player: "Zaheer Khan", nationId: "ind", wickets: 4, runs: 36, overs: "10" },
  { player: "Muttiah Muralitharan", nationId: "sl", wickets: 4, runs: 41, overs: "10" },
  { player: "Shaun Pollock", nationId: "sa", wickets: 3, runs: 28, overs: "10" },
  { player: "Venkatesh Prasad", nationId: "ind", wickets: 3, runs: 33, overs: "9" },
  { player: "Shayne O'Connor", nationId: "nz", wickets: 3, runs: 39, overs: "10" },
] as const;

export type Top5BowlerRow = {
  name: string;
  runs: number;
  overs: string;
  prompt: string;
  wickets: number;
  teamLogo: { url: string; width: number; height: number };
  playedFor: string;
} & DemoContentRowSponsorFields;

export function generateTop5BowlerRows(manifest: CricketHistoricalDemoManifest): Top5BowlerRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));

  return TOP5_BOWLERS_SPELLS.map((spell) => {
    const nation = nationsById.get(spell.nationId);
    if (!nation) {
      throw new Error(`Unknown nation ${spell.nationId} for ${spell.player}`);
    }

    const prompt = [
      `${spell.player} played for ${nation.displayName}, taking ${spell.wickets} wickets`,
      `from ${spell.overs} overs, conceding ${spell.runs} runs.`,
      `Competition: ${TOP5_BOWLERS_COMPETITION}. Grade: ${TOP5_BOWLERS_GRADE}.`,
      "This is a fictional demonstration performance for archive preview only.",
    ].join(" ");

    return {
      name: spell.player,
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

export function sanitiseTop5BowlersVideoMeta(
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

export function buildSanitisedTop5BowlersDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: Top5BowlerRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_TOP5_BOWLERS_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateTop5BowlerRows(args.manifest);
  if (data.length !== 5) {
    throw new Error(`Expected 5 top bowlers, got ${data.length}`);
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
    timings: { ...PRESERVED_TOP5_BOWLERS_TIMINGS },
    frames: [...PRESERVED_TOP5_BOWLERS_FRAMES],
    videoMeta: sanitiseTop5BowlersVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
