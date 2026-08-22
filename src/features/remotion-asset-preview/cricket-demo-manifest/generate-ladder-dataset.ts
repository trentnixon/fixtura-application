import {
  EMPTY_CLUB_SPONSORS,
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_LADDER_FRAMES = [45, 240, 525, 810, 1095, 1380, 1665, 1950, 2235] as const;

export const PRESERVED_LADDER_TIMINGS = {
  FPS_MAIN: 2295,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 300,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 0,
} as const;

export type LadderTeamRow = {
  position: string;
  teamName: string;
  teamHref: string;
  P: string;
  PTS: string;
  Q: string;
  W: string;
  L: string;
  TIE: string;
  "N/R": string;
  BYE: string;
  clubId: number | null;
  clubLogo: string;
  playHQLogo: string;
  clubName: null;
  teamLogo: null;
  prompt: {
    teamName: string;
    position: string;
    gradeName: string;
    stats: {
      wins: string;
      losses: string;
      points: string;
      pointsPlayed: string;
      ties: string;
      noResult: string;
    };
  };
};

export type LadderBlock = {
  ID: number;
  gradeName: string;
  sortOrder: number;
  League: LadderTeamRow[];
  bias: null;
  prompt: {
    gradeName: string;
    teams: Array<{
      teamName: string;
      position: string;
      stats: LadderTeamRow["prompt"]["stats"];
    }>;
  };
} & DemoContentRowSponsorFields;

/** Simple deterministic 32-bit PRNG (mulberry32). */
export function createSeededRng(seedText: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function playedFromParts(w: number, l: number, tie: number, nr: number): number {
  return w + l + tie + nr;
}

export function pointsFromParts(w: number, tie: number, nr: number): number {
  return 2 * w + tie + nr;
}

function formatQuotient(value: number): string {
  const fixed = value.toFixed(3);
  return fixed.startsWith("-") ? fixed : fixed;
}

/**
 * Build fictional but coherent standings for one stage.
 * Rows are sorted by PTS desc, then Q desc, then name.
 */
export function buildFictionalStandingsForStage(args: {
  seed: string;
  stageId: string;
  gradeName: string;
  nations: Array<{ id: string; displayName: string; flagPath: string }>;
}): LadderTeamRow[] {
  const rng = createSeededRng(`${args.seed}::${args.stageId}`);
  const teamCount = args.nations.length;
  const expectedPlayed = Math.max(teamCount - 1, 3);

  const draft = args.nations.map((nation, nationIndex) => {
    // Bias: earlier nations in the historical participant list lean slightly stronger,
    // so associates listed last tend not to top the table while stats stay fictional.
    const strength = 1 - nationIndex / Math.max(teamCount, 1);
    const winBias = Math.floor(strength * expectedPlayed * 0.55);
    const wins = Math.min(
      expectedPlayed,
      Math.max(0, winBias + Math.floor(rng() * (expectedPlayed - winBias + 1) * 0.65)),
    );
    let remaining = expectedPlayed - wins;
    const ties = remaining > 0 && rng() > 0.75 ? 1 : 0;
    remaining -= ties;
    const noResult = remaining > 0 && rng() > 0.8 ? 1 : 0;
    remaining -= noResult;
    const losses = remaining;
    const played = playedFromParts(wins, losses, ties, noResult);
    const points = pointsFromParts(wins, ties, noResult);
    const quotient = strength * 1.2 + (rng() * 0.6 - 0.3);

    return {
      nation,
      wins,
      losses,
      ties,
      noResult,
      played,
      points,
      quotient,
    };
  });

  draft.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.quotient !== a.quotient) return b.quotient - a.quotient;
    return a.nation.displayName.localeCompare(b.nation.displayName);
  });

  // Ensure unique descending Q for stable display ordering.
  return draft.map((row, index) => {
    const position = String(index + 1);
    const q = formatQuotient(
      1.35 - index * (2.5 / Math.max(teamCount - 1, 1)) + row.quotient * 0.05,
    );
    const w = String(row.wins);
    const l = String(row.losses);
    const tie = String(row.ties);
    const nr = String(row.noResult);
    const p = String(row.played);
    const pts = String(row.points);

    return {
      position,
      teamName: row.nation.displayName,
      teamHref: "",
      P: p,
      PTS: pts,
      Q: q,
      W: w,
      L: l,
      TIE: tie,
      "N/R": nr,
      BYE: "0",
      clubId: null,
      clubLogo: row.nation.flagPath,
      playHQLogo: row.nation.flagPath,
      clubName: null,
      teamLogo: null,
      prompt: {
        teamName: row.nation.displayName,
        position,
        gradeName: args.gradeName,
        stats: {
          wins: w,
          losses: l,
          points: pts,
          pointsPlayed: p,
          ties: tie,
          noResult: nr,
        },
      },
    };
  });
}

export function generateLadderBlocks(manifest: CricketHistoricalDemoManifest): LadderBlock[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const seed = manifest.syntheticGeneration.seed;

  const stages = [...manifest.stages].sort((a, b) => a.ladderBlockIndex - b.ladderBlockIndex);

  if (stages.length !== 8) {
    throw new Error(`Expected 8 ladder stages, got ${stages.length}`);
  }

  return stages.map((stage) => {
    const gradeName = stage.displayLabel;
    const nations = stage.participantNationIds.map((id) => {
      const nation = nationsById.get(id);
      if (!nation) {
        throw new Error(`Unknown nation id ${id} in stage ${stage.id}`);
      }
      return {
        id: nation.id,
        displayName: nation.displayName,
        flagPath: nation.flagPath,
      };
    });

    const League = buildFictionalStandingsForStage({
      seed,
      stageId: stage.id,
      gradeName,
      nations,
    });

    return {
      ID: 0,
      gradeName,
      sortOrder: stage.ladderBlockIndex + 1,
      League,
      bias: null,
      prompt: {
        gradeName,
        teams: League.map((team) => ({
          teamName: team.teamName,
          position: team.position,
          stats: team.prompt.stats,
        })),
      },
      ...emptyDemoContentRowSponsorFields(),
    };
  });
}

export function assertLadderStandingsIdentity(blocks: LadderBlock[]): void {
  for (const block of blocks) {
    const positions = new Set<string>();
    for (const team of block.League) {
      const w = Number(team.W);
      const l = Number(team.L);
      const tie = Number(team.TIE);
      const nr = Number(team["N/R"]);
      const p = Number(team.P);
      const pts = Number(team.PTS);
      if (p !== playedFromParts(w, l, tie, nr)) {
        throw new Error(`Played mismatch for ${team.teamName} in ${block.gradeName}`);
      }
      if (pts !== pointsFromParts(w, tie, nr)) {
        throw new Error(`Points mismatch for ${team.teamName} in ${block.gradeName}`);
      }
      if (positions.has(team.position)) {
        throw new Error(`Duplicate position ${team.position} in ${block.gradeName}`);
      }
      positions.add(team.position);
    }
  }
}

/** Strip production media URLs from a cloned videoMeta tree while preserving shapes. */
export function sanitiseLadderVideoMeta(
  videoMeta: Record<string, unknown>,
): Record<string, unknown> {
  const clone = structuredClone(videoMeta) as {
    club: {
      logo: { hasLogo: boolean; url: string; width: number; height: number };
      name: string;
      sport: string;
      sponsors: { primary: unknown[]; general: unknown[]; sponsorNum: number };
      IsAccountClub: boolean;
    };
    video: {
      metadata: { includeSponsors: boolean; compositionId: string; [key: string]: unknown };
      media: {
        HeroImage: { url: string; [key: string]: unknown };
        audio: { url: string; audioOption: unknown };
      };
      templateVariation?: {
        category?: {
          bundleAudio?: { audio_options?: Array<{ URL?: string; [key: string]: unknown }> };
        };
        texture?: { url?: string; [key: string]: unknown };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  };

  clone.club.name = "International Cricket Demo Preview";
  clone.club.logo = {
    hasLogo: false,
    url: "",
    width: clone.club.logo.width || 500,
    height: clone.club.logo.height || 500,
  };
  clone.club.sponsors = { ...EMPTY_CLUB_SPONSORS };
  clone.club.IsAccountClub = false;
  clone.video.metadata.includeSponsors = false;
  if (typeof clone.video.metadata["videoTitle"] === "string") {
    const compositionId =
      typeof clone.video.metadata["compositionId"] === "string"
        ? clone.video.metadata["compositionId"]
        : "CricketDemo";
    clone.video.metadata["videoTitle"] = `International Cricket Demo Preview ${compositionId}`;
  }
  clone.video.media.HeroImage.url = "";
  clone.video.media.audio.url = "";

  const texture = clone.video.templateVariation?.texture;
  if (texture && typeof texture === "object") {
    texture.url = "";
  }

  const audioOptions = clone.video.templateVariation?.category?.bundleAudio?.audio_options;
  if (Array.isArray(audioOptions)) {
    for (const option of audioOptions) {
      if (option && typeof option === "object" && "URL" in option) {
        option.URL = "";
      }
    }
  }

  return clone as unknown as Record<string, unknown>;
}

export function buildSanitisedLadderDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: LadderBlock[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: number;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_LADDER_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateLadderBlocks(args.manifest);
  assertLadderStandingsIdentity(data);

  return {
    data,
    asset: {
      assetID: 0,
      assetTypeID: 0,
      assetCategoryID: 0,
      assetsLinkID: 0,
    },
    render: {
      schedulerId: 0,
      renderId: 0,
    },
    account: {
      accountId: 0,
    },
    timings: { ...PRESERVED_LADDER_TIMINGS },
    frames: [...PRESERVED_LADDER_FRAMES],
    videoMeta: sanitiseLadderVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
