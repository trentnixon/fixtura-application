import { createHash } from "node:crypto";

import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";
import { strikeRateFromRunsAndBalls } from "./generate-top5-batters-dataset";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_RESULTS_FRAMES = [45, 240, 525, 705] as const;

export const PRESERVED_RESULTS_TIMINGS = {
  FPS_MAIN: 585,
  FPS_INTRO: 90,
  FPS_OUTRO: 90,
  FPS_LADDER: 0,
  FPS_SCORECARD: 300,
  FPS_PREFORMANCECARD: 0,
} as const;

export const RESULTS_GRADE_NAME = "2019 World Cup — Group Stage";
export const RESULTS_ROUND = "2019 World Cup — Group Stage";
export const RESULTS_COMPETITION = "2019 Cricket World Cup";

/** Binding order from the Monday Results subitem / manifest. */
export const RESULTS_FIXTURE_IDS_IN_ORDER = [
  "cwc2019-eng-sa",
  "cwc2019-afg-aus",
  "cwc2019-wi-pak",
  "cwc2019-ind-pak",
] as const;

type Logo = { url: string; width: number; height: number };

type BattingPerformance = {
  SR: number;
  runs: number;
  team: string;
  balls: number;
  fours: number;
  sixes: number;
  notOut: boolean;
  player: string;
};

type BowlingPerformance = {
  runs: number;
  team: string;
  overs: number;
  player: string;
  economy: string;
  maidens: number;
  wickets: number;
};

type TeamBlock = {
  logo: Logo;
  name: string;
  overs: string;
  score: string;
  isHome: boolean;
  isClubTeam: boolean;
  battingPerformances: BattingPerformance[];
  bowlingPerformances: BowlingPerformance[];
  homeScoresFirstInnings?: string;
  awayScoresFirstInnings?: string;
};

export type ResultsMatchRow = {
  date: string;
  type: string;
  round: string;
  gameID: string;
  gender: string;
  ground: string;
  prompt: string;
  result: string;
  status: string;
  ageGroup: string;
  awayTeam: TeamBlock;
  homeTeam: TeamBlock;
  gradeName: string;
  resultShort: string;
  teamAwayLogo: Logo;
  teamHomeLogo: Logo;
  resultSummary: {
    winner: string;
    awayTeam: string;
    homeTeam: string;
    resultWord: string;
  };
  assignSponsors: { team: []; grade: []; competition: [] };
  primaryForScreen: [];
  gradeSortOrder: number;
};

type SideScorecard = {
  nationId: string;
  score: number;
  wickets: number;
  oversLabel: string;
  batters: Array<{
    player: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    notOut: boolean;
  }>;
  bowlers: Array<{
    player: string;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
  }>;
};

type FixtureScorePlan = {
  fixtureId: (typeof RESULTS_FIXTURE_IDS_IN_ORDER)[number];
  marginRuns: number;
  winnerNationId: string;
  home: SideScorecard;
  away: SideScorecard;
};

/**
 * Curated fictional ODI scorecards. India/Pakistan uses the brief example;
 * the other three are deterministic demo recreations (not historical results).
 */
export const RESULTS_SCORE_PLANS: FixtureScorePlan[] = [
  {
    fixtureId: "cwc2019-eng-sa",
    marginRuns: 36,
    winnerNationId: "eng",
    home: {
      nationId: "eng",
      score: 287,
      wickets: 8,
      oversLabel: "(50)",
      batters: [
        { player: "Joe Root", runs: 84, balls: 92, fours: 7, sixes: 1, notOut: false },
        { player: "Eoin Morgan", runs: 68, balls: 55, fours: 6, sixes: 2, notOut: false },
        { player: "Ben Stokes", runs: 51, balls: 48, fours: 4, sixes: 1, notOut: true },
      ],
      bowlers: [
        { player: "Kagiso Rabada", overs: 10, maidens: 1, runs: 52, wickets: 3 },
        { player: "Imran Tahir", overs: 10, maidens: 0, runs: 58, wickets: 2 },
        { player: "Lungisani Ngidi", overs: 9, maidens: 0, runs: 49, wickets: 2 },
      ],
    },
    away: {
      nationId: "sa",
      score: 251,
      wickets: 9,
      oversLabel: "(50)",
      batters: [
        { player: "Faf du Plessis", runs: 72, balls: 81, fours: 6, sixes: 1, notOut: false },
        { player: "Quinton de Kock", runs: 45, balls: 39, fours: 5, sixes: 1, notOut: false },
        { player: "Rassie van der Dussen", runs: 38, balls: 44, fours: 3, sixes: 0, notOut: false },
      ],
      bowlers: [
        { player: "Jofra Archer", overs: 10, maidens: 1, runs: 44, wickets: 3 },
        { player: "Mark Wood", overs: 10, maidens: 0, runs: 51, wickets: 2 },
        { player: "Adil Rashid", overs: 10, maidens: 0, runs: 48, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "cwc2019-afg-aus",
    marginRuns: 87,
    winnerNationId: "aus",
    home: {
      nationId: "afg",
      score: 198,
      wickets: 10,
      oversLabel: "(48.2)",
      batters: [
        { player: "Rahmanullah Gurbaz", runs: 54, balls: 61, fours: 5, sixes: 2, notOut: false },
        { player: "Hashmatullah Shahidi", runs: 41, balls: 58, fours: 3, sixes: 0, notOut: false },
      ],
      bowlers: [
        { player: "Mitchell Starc", overs: 9, maidens: 1, runs: 38, wickets: 4 },
        { player: "Pat Cummins", overs: 10, maidens: 1, runs: 41, wickets: 3 },
        { player: "Adam Zampa", overs: 10, maidens: 0, runs: 46, wickets: 2 },
      ],
    },
    away: {
      nationId: "aus",
      score: 285,
      wickets: 6,
      oversLabel: "(50)",
      batters: [
        { player: "Aaron Finch", runs: 96, balls: 99, fours: 8, sixes: 3, notOut: false },
        { player: "David Warner", runs: 71, balls: 68, fours: 7, sixes: 1, notOut: false },
        { player: "Steve Smith", runs: 48, balls: 52, fours: 4, sixes: 0, notOut: true },
      ],
      bowlers: [
        { player: "Rashid Khan", overs: 10, maidens: 0, runs: 55, wickets: 2 },
        { player: "Mujeeb Ur Rahman", overs: 10, maidens: 0, runs: 49, wickets: 2 },
        { player: "Mohammad Nabi", overs: 8, maidens: 0, runs: 42, wickets: 1 },
      ],
    },
  },
  {
    fixtureId: "cwc2019-wi-pak",
    marginRuns: 25,
    winnerNationId: "pak",
    home: {
      nationId: "wi",
      score: 216,
      wickets: 10,
      oversLabel: "(47.1)",
      batters: [
        { player: "Chris Gayle", runs: 58, balls: 49, fours: 5, sixes: 3, notOut: false },
        { player: "Shimron Hetmyer", runs: 44, balls: 51, fours: 3, sixes: 1, notOut: false },
        { player: "Nicholas Pooran", runs: 36, balls: 40, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Mohammad Amir", overs: 9, maidens: 1, runs: 39, wickets: 3 },
        { player: "Wahab Riaz", overs: 9, maidens: 0, runs: 47, wickets: 3 },
        { player: "Shadab Khan", overs: 10, maidens: 0, runs: 51, wickets: 2 },
      ],
    },
    away: {
      nationId: "pak",
      score: 241,
      wickets: 7,
      oversLabel: "(50)",
      batters: [
        { player: "Babar Azam", runs: 81, balls: 94, fours: 7, sixes: 1, notOut: false },
        { player: "Imam-ul-Haq", runs: 55, balls: 66, fours: 4, sixes: 0, notOut: false },
        { player: "Mohammad Hafeez", runs: 39, balls: 41, fours: 3, sixes: 1, notOut: true },
      ],
      bowlers: [
        { player: "Sheldon Cottrell", overs: 10, maidens: 0, runs: 52, wickets: 2 },
        { player: "Jason Holder", overs: 10, maidens: 1, runs: 44, wickets: 2 },
        { player: "Oshane Thomas", overs: 8, maidens: 0, runs: 48, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "cwc2019-ind-pak",
    marginRuns: 26,
    winnerNationId: "ind",
    home: {
      nationId: "ind",
      score: 315,
      wickets: 7,
      oversLabel: "(50)",
      batters: [
        { player: "Rohit Sharma", runs: 92, balls: 94, fours: 8, sixes: 3, notOut: false },
        { player: "Virat Kohli", runs: 77, balls: 71, fours: 6, sixes: 1, notOut: false },
        { player: "Hardik Pandya", runs: 48, balls: 36, fours: 3, sixes: 2, notOut: true },
      ],
      bowlers: [
        { player: "Mohammad Amir", overs: 10, maidens: 0, runs: 68, wickets: 2 },
        { player: "Wahab Riaz", overs: 10, maidens: 0, runs: 71, wickets: 2 },
        { player: "Shadab Khan", overs: 10, maidens: 0, runs: 59, wickets: 2 },
      ],
    },
    away: {
      nationId: "pak",
      score: 289,
      wickets: 9,
      oversLabel: "(50)",
      batters: [
        { player: "Babar Azam", runs: 88, balls: 97, fours: 7, sixes: 1, notOut: false },
        { player: "Fakhar Zaman", runs: 62, balls: 58, fours: 6, sixes: 2, notOut: false },
        { player: "Imad Wasim", runs: 41, balls: 35, fours: 3, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Jasprit Bumrah", overs: 10, maidens: 1, runs: 43, wickets: 3 },
        { player: "Bhuvneshwar Kumar", overs: 10, maidens: 0, runs: 55, wickets: 2 },
        { player: "Yuzvendra Chahal", overs: 10, maidens: 0, runs: 52, wickets: 2 },
      ],
    },
  },
];

function flagLogo(flagPath: string): Logo {
  return { url: flagPath, width: 640, height: 480 };
}

function deterministicGameId(fixtureId: string): string {
  return createHash("sha256").update(`results:${fixtureId}`).digest("hex").slice(0, 8);
}

export function formatResultsDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function assertBattingPerformanceConsistency(row: BattingPerformance): void {
  if (row.fours * 4 + row.sixes * 6 > row.runs) {
    throw new Error(`Boundaries exceed runs for ${row.player}`);
  }
  const expectedSr = strikeRateFromRunsAndBalls(row.runs, row.balls);
  if (row.SR !== expectedSr) {
    throw new Error(`SR mismatch for ${row.player}: ${row.SR} !== ${expectedSr}`);
  }
}

export function assertBowlingPerformanceConsistency(row: BowlingPerformance): void {
  const expected = ((row.runs / row.overs) * 1).toFixed(2);
  // Integer overs only in this generator — economy = runs / overs.
  if (row.economy !== Number((row.runs / row.overs).toFixed(2)).toFixed(2)) {
    throw new Error(`Economy mismatch for ${row.player}: ${row.economy} vs ${expected}`);
  }
}

function buildBattingPerformances(
  teamName: string,
  batters: SideScorecard["batters"],
): BattingPerformance[] {
  return batters.map((batter) => {
    const row: BattingPerformance = {
      SR: strikeRateFromRunsAndBalls(batter.runs, batter.balls),
      runs: batter.runs,
      team: teamName,
      balls: batter.balls,
      fours: batter.fours,
      sixes: batter.sixes,
      notOut: batter.notOut,
      player: batter.player,
    };
    assertBattingPerformanceConsistency(row);
    return row;
  });
}

function buildBowlingPerformances(
  bowlingTeamName: string,
  bowlers: SideScorecard["bowlers"],
): BowlingPerformance[] {
  return bowlers.map((bowler) => {
    const row: BowlingPerformance = {
      runs: bowler.runs,
      team: bowlingTeamName,
      overs: bowler.overs,
      player: bowler.player,
      economy: Number((bowler.runs / bowler.overs).toFixed(2)).toFixed(2),
      maidens: bowler.maidens,
      wickets: bowler.wickets,
    };
    assertBowlingPerformanceConsistency(row);
    return row;
  });
}

function battingDescription(row: BattingPerformance): string {
  const boundaryBits = [
    row.fours > 0 ? `with ${row.fours} four${row.fours === 1 ? "" : "s"}` : null,
    row.sixes > 0 ? `with ${row.sixes} six${row.sixes === 1 ? "" : "es"}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const boundaryClause = boundaryBits ? `, ${boundaryBits}` : "";
  const dismissal = row.notOut ? "they were not out." : "they were dismissed.";
  return `${row.player}, scored ${row.runs} Runs from (${row.balls}) balls${boundaryClause}, at a strike Rate of ${row.SR.toFixed(2)}., ${dismissal}`;
}

function bowlingDescription(row: BowlingPerformance): string {
  return `${row.player}, bowled ${row.overs} overs, took ${row.wickets} wicket${row.wickets === 1 ? "" : "s"} for ${row.runs} runs, at an economy of ${row.economy}.`;
}

function buildPromptTeam(args: {
  teamName: string;
  scorecard: SideScorecard;
  batting: BattingPerformance[];
  bowlingAgainst: BowlingPerformance[];
}): {
  teamName: string;
  innings: Array<{
    teamName: string;
    score: string;
    overs: string;
    wickets: number;
    battingOrder: Array<{ description: string }>;
    bowlingFigures: Array<{ description: string }>;
    fieldingStats: [];
    fallOfWickets: [];
    inningsNumber: number;
    inningsName: string;
  }>;
  totalScore: string;
  totalWickets: number;
} {
  return {
    teamName: args.teamName,
    innings: [
      {
        teamName: args.teamName,
        score: "",
        overs: "",
        wickets: args.scorecard.wickets,
        battingOrder: args.batting.map((row) => ({ description: battingDescription(row) })),
        bowlingFigures: args.bowlingAgainst.map((row) => ({
          description: bowlingDescription(row),
        })),
        fieldingStats: [],
        fallOfWickets: [],
        inningsNumber: 1,
        inningsName: `${args.teamName} Batting`,
      },
    ],
    totalScore: String(args.scorecard.score),
    totalWickets: args.scorecard.wickets,
  };
}

export function generateResultsRows(manifest: CricketHistoricalDemoManifest): ResultsMatchRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const venuesById = new Map(manifest.venues.map((venue) => [venue.id, venue]));
  const fixturesById = new Map(manifest.fixtures.map((fixture) => [fixture.id, fixture]));
  const plansById = new Map(RESULTS_SCORE_PLANS.map((plan) => [plan.fixtureId, plan]));

  return RESULTS_FIXTURE_IDS_IN_ORDER.map((fixtureId) => {
    const fixture = fixturesById.get(fixtureId);
    const plan = plansById.get(fixtureId);
    if (!fixture || !plan) {
      throw new Error(`Missing results fixture/plan ${fixtureId}`);
    }

    const homeNation = nationsById.get(fixture.homeNationId);
    const awayNation = nationsById.get(fixture.awayNationId);
    const venue = venuesById.get(fixture.venueId);
    if (!homeNation || !awayNation || !venue) {
      throw new Error(`Incomplete refs for results fixture ${fixtureId}`);
    }
    if (plan.home.nationId !== homeNation.id || plan.away.nationId !== awayNation.id) {
      throw new Error(`Score plan nations mismatch for ${fixtureId}`);
    }

    const homeLogo = flagLogo(homeNation.flagPath);
    const awayLogo = flagLogo(awayNation.flagPath);
    const homeName = homeNation.displayName;
    const awayName = awayNation.displayName;

    const homeBatting = buildBattingPerformances(homeName, plan.home.batters);
    const awayBatting = buildBattingPerformances(awayName, plan.away.batters);
    // Bowling figures sit with the batting side's opponents (same as source JSON).
    const homeBowling = buildBowlingPerformances(awayName, plan.home.bowlers);
    const awayBowling = buildBowlingPerformances(homeName, plan.away.bowlers);

    const winnerNation = nationsById.get(plan.winnerNationId);
    if (!winnerNation) {
      throw new Error(`Unknown winner nation ${plan.winnerNationId}`);
    }
    const loserName = winnerNation.id === homeNation.id ? awayName : homeName;
    const winnerName = winnerNation.displayName;

    const homeScore = plan.home.score;
    const awayScore = plan.away.score;
    if (Math.abs(homeScore - awayScore) !== plan.marginRuns) {
      throw new Error(`Margin mismatch for ${fixtureId}`);
    }

    const result = `${winnerName} won by ${plan.marginRuns} runs`;
    const resultShort = `${winnerName} def ${loserName}`;

    const homeTeam: TeamBlock = {
      logo: homeLogo,
      name: homeName,
      overs: plan.home.oversLabel,
      score: String(homeScore),
      isHome: true,
      isClubTeam: false,
      battingPerformances: homeBatting,
      bowlingPerformances: homeBowling,
      homeScoresFirstInnings: "1",
    };

    const awayTeam: TeamBlock = {
      logo: awayLogo,
      name: awayName,
      overs: plan.away.oversLabel,
      score: String(awayScore),
      isHome: false,
      isClubTeam: false,
      battingPerformances: awayBatting,
      bowlingPerformances: awayBowling,
      awayScoresFirstInnings: "1",
    };

    const promptObject = {
      matchContext: {
        competition: RESULTS_COMPETITION,
        grade: RESULTS_GRADE_NAME,
        round: RESULTS_ROUND,
        ground: venue.displayName,
        matchType: "One Day",
        tossWinner: homeName,
        tossResult: `${homeName} won the toss and elected to bat`,
        resultStatement: result,
        dayOne: fixture.date,
        finalDaysPlay: fixture.date,
        note: "Fictional demonstration scorecard for archive preview only.",
      },
      homeTeam: buildPromptTeam({
        teamName: homeName,
        scorecard: plan.home,
        batting: homeBatting,
        bowlingAgainst: homeBowling,
      }),
      awayTeam: buildPromptTeam({
        teamName: awayName,
        scorecard: plan.away,
        batting: awayBatting,
        bowlingAgainst: awayBowling,
      }),
    };

    return {
      date: formatResultsDate(fixture.date),
      type: "One Day",
      round: RESULTS_ROUND,
      gameID: deterministicGameId(fixtureId),
      gender: "Men",
      ground: venue.displayName,
      prompt: JSON.stringify(promptObject, null, 2),
      result,
      status: "Final",
      ageGroup: "Senior",
      awayTeam,
      homeTeam,
      gradeName: RESULTS_GRADE_NAME,
      resultShort,
      teamAwayLogo: awayLogo,
      teamHomeLogo: homeLogo,
      resultSummary: {
        winner: winnerName,
        awayTeam: awayName,
        homeTeam: homeName,
        resultWord: "won",
      },
      assignSponsors: {
        team: [],
        grade: [],
        competition: [],
      },
      primaryForScreen: [],
      gradeSortOrder: 0,
    };
  });
}

export function sanitiseResultsVideoMeta(
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

export function buildSanitisedResultsDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: ResultsMatchRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  errors: [];
  frames: number[];
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_RESULTS_TIMINGS;
  videoMeta: Record<string, unknown>;
} {
  const data = generateResultsRows(args.manifest);
  if (data.length !== 4) {
    throw new Error(`Expected 4 results fixtures, got ${data.length}`);
  }

  return {
    data,
    asset: {
      assetID: 0,
      assetTypeID: 0,
      assetCategoryID: 0,
      assetsLinkID: "",
    },
    errors: [],
    frames: [...PRESERVED_RESULTS_FRAMES],
    render: {
      schedulerId: 0,
      renderId: 0,
    },
    account: {
      accountId: 0,
    },
    timings: { ...PRESERVED_RESULTS_TIMINGS },
    videoMeta: sanitiseResultsVideoMeta(args.existingVideoMeta),
  };
}
