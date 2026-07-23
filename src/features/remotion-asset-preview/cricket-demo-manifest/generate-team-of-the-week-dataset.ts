import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";
import { strikeRateFromRunsAndBalls } from "./generate-top5-batters-dataset";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_TEAM_OF_THE_WEEK_FRAMES = [45, 180] as const;

export const PRESERVED_TEAM_OF_THE_WEEK_TIMINGS = {
  FPS_MAIN: 180,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 0,
  FPS_PREFORMANCECARD: 180,
} as const;

export const TEAM_OF_THE_WEEK_POOL_ID = "pool-t20wc-2022-team-of-week";
export const TEAM_OF_THE_WEEK_LABEL = "2022 T20 World Cup Demo XI";

type Logo = { url: string; width: number; height: number };

type BattingStats = {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  notOut: boolean;
  team: string;
};

type BowlingStats = {
  wickets: number;
  overs: number;
  maidens: number;
  runs: number;
  economy: number;
  team: string;
};

export type TeamOfTheWeekRow = {
  category: string;
  categoryDetail: { type: string; position: string };
  rank: number;
  player: string;
  primaryTeam: string;
  club: { name: string; logo: Logo };
  batting?: BattingStats;
  bowling?: BowlingStats;
  allRounder?: {
    score: number;
    formula: string;
    battingContribution: number;
    bowlingContribution: number;
  };
  rankings: Record<string, number>;
  prompt: string;
};

type TotwPlan = {
  name: string;
  nationId: string;
  category: "Batter" | "All-Rounder" | "Bowler" | "Twelfth Man";
  position: string;
  rank: number;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    notOut: boolean;
  };
  bowling?: {
    wickets: number;
    overs: number;
    maidens: number;
    runs: number;
  };
  rankings: Record<string, number>;
};

/** Canonical 12-record Demo XI from Monday brief / manifest pool order. */
export const TEAM_OF_THE_WEEK_PLANS: TotwPlan[] = [
  {
    name: "Virat Kohli",
    nationId: "ind",
    category: "Batter",
    position: "higheststrikerate",
    rank: 1,
    batting: { runs: 68, balls: 32, fours: 5, sixes: 4, notOut: false },
    rankings: { topRunScorer: 3, highestStrikeRate: 1 },
  },
  {
    name: "Jos Buttler",
    nationId: "eng",
    category: "Batter",
    position: "higheststrikerate",
    rank: 2,
    batting: { runs: 54, balls: 27, fours: 4, sixes: 3, notOut: true },
    rankings: { topRunScorer: 5, highestStrikeRate: 2 },
  },
  {
    name: "Babar Azam",
    nationId: "pak",
    category: "Batter",
    position: "higheststrikerate",
    rank: 3,
    batting: { runs: 49, balls: 28, fours: 5, sixes: 2, notOut: false },
    rankings: { topRunScorer: 6, highestStrikeRate: 3 },
  },
  {
    name: "Litton Das",
    nationId: "ban",
    category: "Batter",
    position: "topscorer",
    rank: 4,
    batting: { runs: 82, balls: 51, fours: 7, sixes: 3, notOut: false },
    rankings: { topRunScorer: 1, highestStrikeRate: 7 },
  },
  {
    name: "Pathum Nissanka",
    nationId: "sl",
    category: "Batter",
    position: "topscorer",
    rank: 5,
    batting: { runs: 71, balls: 48, fours: 6, sixes: 2, notOut: false },
    rankings: { topRunScorer: 2, highestStrikeRate: 8 },
  },
  {
    name: "Sikandar Raza",
    nationId: "zim",
    category: "All-Rounder",
    position: "topallrounder",
    rank: 1,
    batting: { runs: 46, balls: 31, fours: 3, sixes: 2, notOut: false },
    bowling: { wickets: 2, overs: 4, maidens: 0, runs: 22 },
    rankings: {
      topRunScorer: 7,
      highestStrikeRate: 5,
      mostWickets: 5,
      bestEconomy: 3,
      topAllRounder: 1,
    },
  },
  {
    name: "Mohammad Nabi",
    nationId: "afg",
    category: "All-Rounder",
    position: "topallrounder",
    rank: 2,
    batting: { runs: 38, balls: 26, fours: 2, sixes: 2, notOut: true },
    bowling: { wickets: 2, overs: 4, maidens: 0, runs: 24 },
    rankings: {
      topRunScorer: 8,
      highestStrikeRate: 6,
      mostWickets: 6,
      bestEconomy: 4,
      topAllRounder: 2,
    },
  },
  {
    name: "Trent Boult",
    nationId: "nz",
    category: "Bowler",
    position: "mostwickets",
    rank: 1,
    bowling: { wickets: 4, overs: 4, maidens: 0, runs: 18 },
    rankings: { mostWickets: 1, bestEconomy: 1 },
  },
  {
    name: "Kagiso Rabada",
    nationId: "sa",
    category: "Bowler",
    position: "mostwickets",
    rank: 2,
    bowling: { wickets: 3, overs: 4, maidens: 0, runs: 21 },
    rankings: { mostWickets: 2, bestEconomy: 2 },
  },
  {
    name: "Josh Little",
    nationId: "ire",
    category: "Bowler",
    position: "mostwickets",
    rank: 3,
    bowling: { wickets: 3, overs: 3.4, maidens: 0, runs: 23 },
    rankings: { mostWickets: 3, bestEconomy: 5 },
  },
  {
    name: "Alzarri Joseph",
    nationId: "wi",
    category: "Bowler",
    position: "mostwickets",
    rank: 4,
    bowling: { wickets: 2, overs: 4, maidens: 0, runs: 27 },
    rankings: { mostWickets: 4, bestEconomy: 6 },
  },
  {
    name: "Glenn Maxwell",
    nationId: "aus",
    category: "Twelfth Man",
    position: "bestoftherest",
    rank: 1,
    batting: { runs: 33, balls: 18, fours: 2, sixes: 2, notOut: false },
    rankings: { topRunScorer: 9, highestStrikeRate: 4 },
  },
];

function flagLogo(flagPath: string): Logo {
  return { url: flagPath, width: 640, height: 480 };
}

function buildBatting(team: string, batting: NonNullable<TotwPlan["batting"]>): BattingStats {
  if (batting.fours * 4 + batting.sixes * 6 > batting.runs) {
    throw new Error(`Boundaries exceed runs`);
  }
  return {
    runs: batting.runs,
    balls: batting.balls,
    fours: batting.fours,
    sixes: batting.sixes,
    strikeRate: strikeRateFromRunsAndBalls(batting.runs, batting.balls),
    notOut: batting.notOut,
    team,
  };
}

function buildBowling(team: string, bowling: NonNullable<TotwPlan["bowling"]>): BowlingStats {
  const deliveries = Number.isInteger(bowling.overs)
    ? bowling.overs * 6
    : Math.floor(bowling.overs) * 6 + Math.round((bowling.overs % 1) * 10);
  if (deliveries <= 0) {
    throw new Error("Invalid bowling overs");
  }
  const economy = Number(((bowling.runs / deliveries) * 6).toFixed(2));
  return {
    wickets: bowling.wickets,
    overs: bowling.overs,
    maidens: bowling.maidens,
    runs: bowling.runs,
    economy,
    team,
  };
}

function buildPrompt(args: {
  plan: TotwPlan;
  teamName: string;
  batting?: BattingStats;
  bowling?: BowlingStats;
  allRounderScore?: number;
}): string {
  const { plan, teamName, batting, bowling, allRounderScore } = args;
  const roleLabel =
    plan.category === "Twelfth Man"
      ? "twelfth man"
      : plan.category === "All-Rounder"
        ? plan.rank === 1
          ? "top all-rounder"
          : `rank ${plan.rank} all-rounder`
        : plan.category === "Bowler"
          ? plan.rank === 1
            ? "top bowler"
            : `rank ${plan.rank} bowler`
          : plan.position === "higheststrikerate" && plan.rank === 1
            ? "top batter"
            : `rank ${plan.rank} batter`;

  const parts = [
    `${plan.name} from ${teamName}. has been selected as the ${roleLabel} in the Team of the Week.`,
  ];

  if (batting) {
    const boundaryBits = [
      batting.fours > 0 ? `${batting.fours} fours` : null,
      batting.sixes > 0 ? `${batting.sixes} sixes` : null,
    ]
      .filter(Boolean)
      .join(", and ");
    parts.push(
      `Batting: scored ${batting.runs} runs, from ${batting.balls} balls, with a strike rate of ${batting.strikeRate.toFixed(1)}${boundaryBits ? `, including ${boundaryBits}` : ""}.`,
    );
  }
  if (bowling) {
    parts.push(
      `Bowling: took ${bowling.wickets} wicket${bowling.wickets === 1 ? "" : "s"}, from ${bowling.overs} overs, conceding ${bowling.runs} runs, with an economy rate of ${bowling.economy}${bowling.maidens > 0 ? `, including ${bowling.maidens} maiden${bowling.maidens === 1 ? "" : "s"}` : ""}.`,
    );
  }
  if (allRounderScore !== undefined) {
    parts.push(`All-rounder score: ${allRounderScore.toFixed(1)}.`);
  }
  parts.push("This is a fictional demonstration selection for archive preview only.");
  return parts.join(" ");
}

export function generateTeamOfTheWeekRows(
  manifest: CricketHistoricalDemoManifest,
): TeamOfTheWeekRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const pool = manifest.playerPools.find((item) => item.id === TEAM_OF_THE_WEEK_POOL_ID);
  if (!pool || pool.players.length !== 12) {
    throw new Error(`Expected 12 players in ${TEAM_OF_THE_WEEK_POOL_ID}`);
  }

  const rows = TEAM_OF_THE_WEEK_PLANS.map((plan) => {
    const nation = nationsById.get(plan.nationId);
    if (!nation) {
      throw new Error(`Unknown nation ${plan.nationId}`);
    }
    const teamName = nation.displayName;
    const batting = plan.batting ? buildBatting(teamName, plan.batting) : undefined;
    const bowling = plan.bowling ? buildBowling(teamName, plan.bowling) : undefined;

    let allRounder: TeamOfTheWeekRow["allRounder"];
    if (plan.category === "All-Rounder") {
      if (!batting || !bowling) {
        throw new Error(`All-rounder ${plan.name} requires batting and bowling`);
      }
      allRounder = {
        score: batting.runs * bowling.wickets,
        formula: "runs × wickets",
        battingContribution: batting.runs,
        bowlingContribution: bowling.wickets,
      };
    }

    const row: TeamOfTheWeekRow = {
      category: plan.category,
      categoryDetail: { type: plan.category, position: plan.position },
      rank: plan.rank,
      player: plan.name,
      primaryTeam: teamName,
      club: { name: teamName, logo: flagLogo(nation.flagPath) },
      rankings: { ...plan.rankings },
      prompt: buildPrompt({
        plan,
        teamName,
        batting,
        bowling,
        allRounderScore: allRounder?.score,
      }),
    };

    if (batting) {
      row.batting = batting;
    }
    if (bowling) {
      row.bowling = bowling;
    }
    if (allRounder) {
      row.allRounder = allRounder;
    }

    // Bowlers in source sometimes also carry empty batting — keep bowling-only for pure bowlers.
    return row;
  });

  const names = rows.map((row) => row.player);
  const expected = pool.players.map((player) => player.name);
  if (names.join("|") !== expected.join("|")) {
    throw new Error(
      `TOTW player order mismatch.\nExpected: ${expected.join(", ")}\nGot: ${names.join(", ")}`,
    );
  }

  const nationIds = new Set(
    rows.map((row) => {
      const plan = TEAM_OF_THE_WEEK_PLANS.find((item) => item.name === row.player);
      return plan?.nationId;
    }),
  );
  if (nationIds.size !== 12) {
    throw new Error("Expected all 12 Full Members represented once");
  }

  return rows;
}

export function sanitiseTeamOfTheWeekVideoMeta(
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
  clone.video.groupingCategory = TEAM_OF_THE_WEEK_LABEL;
  return clone;
}

export function buildSanitisedTeamOfTheWeekDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: TeamOfTheWeekRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_TEAM_OF_THE_WEEK_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateTeamOfTheWeekRows(args.manifest);
  if (data.length !== 12) {
    throw new Error(`Expected 12 team-of-the-week records, got ${data.length}`);
  }

  return {
    data,
    asset: {
      assetID: 0,
      assetTypeID: 0,
      assetCategoryID: 0,
      assetsLinkID: "",
    },
    render: { schedulerId: 0, renderId: 0 },
    account: { accountId: 0 },
    timings: { ...PRESERVED_TEAM_OF_THE_WEEK_TIMINGS },
    frames: [...PRESERVED_TEAM_OF_THE_WEEK_FRAMES],
    videoMeta: sanitiseTeamOfTheWeekVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
