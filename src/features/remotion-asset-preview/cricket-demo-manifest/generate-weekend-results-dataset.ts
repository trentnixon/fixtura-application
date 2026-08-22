import { createHash } from "node:crypto";

import {
  economyFromRunsAndOvers,
  legalDeliveriesFromOvers,
} from "./generate-bowling-performances-dataset";
import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";
import { strikeRateFromRunsAndBalls } from "./generate-top5-batters-dataset";

import {
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_WEEKEND_RESULTS_FRAMES = [
  195, 390, 585, 780, 975, 1170, 1365, 1560, 1755,
] as const;

export const PRESERVED_WEEKEND_RESULTS_TIMINGS = {
  FPS_MAIN: 10000,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 210,
  FPS_PREFORMANCECARD: 0,
} as const;

export const WEEKEND_RESULTS_GRADE = "2022 T20 World Cup";
export const WEEKEND_RESULTS_COMPETITION = "2022 Men's T20 World Cup";

export const WEEKEND_RESULTS_FIXTURE_IDS = [
  "t20wc2022-aus-nz",
  "t20wc2022-ind-pak",
  "t20wc2022-eng-afg",
  "t20wc2022-sa-ind",
  "t20wc2022-ban-ind",
  "t20wc2022-aus-afg",
  "t20wc2022-pak-sa",
  "t20wc2022-nz-eng",
  "t20wc2022-wi-ire",
] as const;

type Logo = { url: string; width: number; height: number };

type BattingPerformance = {
  player: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  SR: number;
  team: string;
  notOut: boolean;
};

type BowlingPerformance = {
  player: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
  team: string;
};

type TeamBlock = {
  name: string;
  isHome: boolean;
  logo: Logo;
  score: string;
  overs: string;
  homeScoresFirstInnings?: string;
  awayScoresFirstInnings?: string;
  battingPerformances: BattingPerformance[];
  bowlingPerformances: BowlingPerformance[];
  isClubTeam: boolean;
};

export type WeekendResultsRow = {
  gameID: string;
  status: string;
  homeTeam: TeamBlock;
  awayTeam: TeamBlock;
  teamHomeLogo: Logo;
  teamAwayLogo: Logo;
  date: string;
  type: string;
  ground: string;
  round: string;
  gender: string;
  ageGroup: string;
  gradeName: string;
  gradeSortOrder: number;
  result: string;
  resultShort: string;
  resultSummary: {
    homeTeam: string;
    awayTeam: string;
    winner: string;
    resultWord: string;
  };
  prompt: string;
} & DemoContentRowSponsorFields;

type SidePlan = {
  nationId: string;
  runs: number;
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
  /** Bowlers who bowled *at* this side (opposition attack). */
  bowlers: Array<{
    player: string;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
  }>;
};

type FixturePlan = {
  fixtureId: (typeof WEEKEND_RESULTS_FIXTURE_IDS)[number];
  winnerNationId: string;
  winBy: { kind: "runs"; margin: number } | { kind: "wickets"; margin: number };
  home: SidePlan;
  away: SidePlan;
};

/** Curated fictional T20 scorecards (not historical results). */
export const WEEKEND_RESULTS_SCORE_PLANS: FixturePlan[] = [
  {
    fixtureId: "t20wc2022-aus-nz",
    winnerNationId: "aus",
    winBy: { kind: "runs", margin: 18 },
    home: {
      nationId: "aus",
      runs: 179,
      wickets: 5,
      oversLabel: "(20)",
      batters: [
        { player: "Aaron Finch", runs: 58, balls: 42, fours: 5, sixes: 2, notOut: false },
        { player: "Glenn Maxwell", runs: 41, balls: 24, fours: 3, sixes: 2, notOut: true },
        { player: "David Warner", runs: 33, balls: 28, fours: 3, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Trent Boult", overs: 4, maidens: 0, runs: 32, wickets: 2 },
        { player: "Lockie Ferguson", overs: 4, maidens: 0, runs: 38, wickets: 2 },
        { player: "Ish Sodhi", overs: 4, maidens: 0, runs: 29, wickets: 1 },
      ],
    },
    away: {
      nationId: "nz",
      runs: 161,
      wickets: 8,
      oversLabel: "(20)",
      batters: [
        { player: "Kane Williamson", runs: 47, balls: 39, fours: 4, sixes: 1, notOut: false },
        { player: "Devon Conway", runs: 36, balls: 31, fours: 3, sixes: 1, notOut: false },
        { player: "Glenn Phillips", runs: 28, balls: 19, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Mitchell Starc", overs: 4, maidens: 0, runs: 29, wickets: 3 },
        { player: "Pat Cummins", overs: 4, maidens: 0, runs: 34, wickets: 2 },
        { player: "Adam Zampa", overs: 4, maidens: 0, runs: 27, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-ind-pak",
    winnerNationId: "ind",
    winBy: { kind: "runs", margin: 12 },
    home: {
      nationId: "ind",
      runs: 168,
      wickets: 6,
      oversLabel: "(20)",
      batters: [
        { player: "Virat Kohli", runs: 62, balls: 44, fours: 5, sixes: 2, notOut: false },
        { player: "Suryakumar Yadav", runs: 39, balls: 22, fours: 3, sixes: 2, notOut: true },
        { player: "Rohit Sharma", runs: 28, balls: 21, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Shaheen Shah Afridi", overs: 4, maidens: 0, runs: 31, wickets: 2 },
        { player: "Haris Rauf", overs: 4, maidens: 0, runs: 36, wickets: 2 },
        { player: "Shadab Khan", overs: 4, maidens: 0, runs: 28, wickets: 1 },
      ],
    },
    away: {
      nationId: "pak",
      runs: 156,
      wickets: 8,
      oversLabel: "(20)",
      batters: [
        { player: "Babar Azam", runs: 51, balls: 42, fours: 4, sixes: 1, notOut: false },
        { player: "Mohammad Rizwan", runs: 34, balls: 29, fours: 2, sixes: 1, notOut: false },
        { player: "Iftikhar Ahmed", runs: 26, balls: 18, fours: 1, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Jasprit Bumrah", overs: 4, maidens: 0, runs: 24, wickets: 3 },
        { player: "Hardik Pandya", overs: 4, maidens: 0, runs: 30, wickets: 2 },
        { player: "Ravindra Jadeja", overs: 4, maidens: 0, runs: 27, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-eng-afg",
    winnerNationId: "eng",
    winBy: { kind: "wickets", margin: 5 },
    home: {
      nationId: "eng",
      runs: 142,
      wickets: 5,
      oversLabel: "(18.2)",
      batters: [
        { player: "Jos Buttler", runs: 44, balls: 33, fours: 4, sixes: 1, notOut: true },
        { player: "Dawid Malan", runs: 36, balls: 28, fours: 3, sixes: 1, notOut: false },
        { player: "Ben Stokes", runs: 29, balls: 21, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Fazalhaq Farooqi", overs: 4, maidens: 0, runs: 28, wickets: 2 },
        { player: "Rashid Khan", overs: 4, maidens: 0, runs: 26, wickets: 2 },
        { player: "Mujeeb Ur Rahman", overs: 4, maidens: 0, runs: 31, wickets: 1 },
      ],
    },
    away: {
      nationId: "afg",
      runs: 138,
      wickets: 9,
      oversLabel: "(20)",
      batters: [
        { player: "Rahmanullah Gurbaz", runs: 41, balls: 32, fours: 3, sixes: 2, notOut: false },
        { player: "Ibrahim Zadran", runs: 33, balls: 30, fours: 2, sixes: 1, notOut: false },
        { player: "Mohammad Nabi", runs: 24, balls: 18, fours: 1, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Mark Wood", overs: 4, maidens: 0, runs: 25, wickets: 3 },
        { player: "Sam Curran", overs: 4, maidens: 0, runs: 29, wickets: 3 },
        { player: "Adil Rashid", overs: 4, maidens: 0, runs: 27, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-sa-ind",
    winnerNationId: "ind",
    winBy: { kind: "runs", margin: 21 },
    home: {
      nationId: "sa",
      runs: 137,
      wickets: 8,
      oversLabel: "(20)",
      batters: [
        { player: "Quinton de Kock", runs: 39, balls: 31, fours: 3, sixes: 1, notOut: false },
        { player: "Aiden Markram", runs: 31, balls: 26, fours: 2, sixes: 1, notOut: false },
        { player: "David Miller", runs: 27, balls: 18, fours: 1, sixes: 2, notOut: false },
      ],
      bowlers: [
        { player: "Arshdeep Singh", overs: 4, maidens: 0, runs: 28, wickets: 3 },
        { player: "Bhuvneshwar Kumar", overs: 4, maidens: 0, runs: 26, wickets: 2 },
        { player: "Axar Patel", overs: 4, maidens: 0, runs: 24, wickets: 2 },
      ],
    },
    away: {
      nationId: "ind",
      runs: 158,
      wickets: 6,
      oversLabel: "(20)",
      batters: [
        { player: "KL Rahul", runs: 52, balls: 39, fours: 4, sixes: 2, notOut: false },
        { player: "Hardik Pandya", runs: 38, balls: 24, fours: 2, sixes: 2, notOut: true },
        { player: "Suryakumar Yadav", runs: 29, balls: 19, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Kagiso Rabada", overs: 4, maidens: 0, runs: 33, wickets: 2 },
        { player: "Anrich Nortje", overs: 4, maidens: 0, runs: 35, wickets: 2 },
        { player: "Tabraiz Shamsi", overs: 4, maidens: 0, runs: 28, wickets: 1 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-ban-ind",
    winnerNationId: "ind",
    winBy: { kind: "wickets", margin: 5 },
    home: {
      nationId: "ban",
      runs: 145,
      wickets: 8,
      oversLabel: "(20)",
      batters: [
        { player: "Litton Das", runs: 48, balls: 36, fours: 4, sixes: 1, notOut: false },
        { player: "Shakib Al Hasan", runs: 34, balls: 27, fours: 2, sixes: 1, notOut: false },
        { player: "Afif Hossain", runs: 26, balls: 19, fours: 1, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Mohammed Shami", overs: 4, maidens: 0, runs: 27, wickets: 3 },
        { player: "Ravindra Jadeja", overs: 4, maidens: 0, runs: 29, wickets: 2 },
        { player: "Hardik Pandya", overs: 3, maidens: 0, runs: 24, wickets: 2 },
      ],
    },
    away: {
      nationId: "ind",
      runs: 148,
      wickets: 5,
      oversLabel: "(18.5)",
      batters: [
        { player: "Rohit Sharma", runs: 46, balls: 34, fours: 4, sixes: 2, notOut: false },
        { player: "Virat Kohli", runs: 41, balls: 31, fours: 3, sixes: 1, notOut: true },
        { player: "Rishabh Pant", runs: 27, balls: 18, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Taskin Ahmed", overs: 4, maidens: 0, runs: 31, wickets: 2 },
        { player: "Mustafizur Rahman", overs: 4, maidens: 0, runs: 29, wickets: 2 },
        { player: "Shakib Al Hasan", overs: 4, maidens: 0, runs: 27, wickets: 1 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-aus-afg",
    winnerNationId: "aus",
    winBy: { kind: "runs", margin: 31 },
    home: {
      nationId: "aus",
      runs: 183,
      wickets: 4,
      oversLabel: "(20)",
      batters: [
        { player: "David Warner", runs: 64, balls: 41, fours: 5, sixes: 3, notOut: false },
        { player: "Mitchell Marsh", runs: 45, balls: 29, fours: 3, sixes: 2, notOut: true },
        { player: "Aaron Finch", runs: 32, balls: 24, fours: 3, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Naveen-ul-Haq", overs: 4, maidens: 0, runs: 38, wickets: 2 },
        { player: "Rashid Khan", overs: 4, maidens: 0, runs: 34, wickets: 1 },
        { player: "Fazalhaq Farooqi", overs: 4, maidens: 0, runs: 36, wickets: 1 },
      ],
    },
    away: {
      nationId: "afg",
      runs: 152,
      wickets: 9,
      oversLabel: "(20)",
      batters: [
        { player: "Hazratullah Zazai", runs: 42, balls: 29, fours: 3, sixes: 2, notOut: false },
        { player: "Najibullah Zadran", runs: 35, balls: 27, fours: 2, sixes: 2, notOut: false },
        { player: "Rashid Khan", runs: 24, balls: 16, fours: 1, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Josh Hazlewood", overs: 4, maidens: 0, runs: 26, wickets: 3 },
        { player: "Mitchell Starc", overs: 4, maidens: 0, runs: 31, wickets: 3 },
        { player: "Adam Zampa", overs: 4, maidens: 0, runs: 28, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-pak-sa",
    winnerNationId: "pak",
    winBy: { kind: "runs", margin: 15 },
    home: {
      nationId: "pak",
      runs: 163,
      wickets: 7,
      oversLabel: "(20)",
      batters: [
        { player: "Mohammad Rizwan", runs: 55, balls: 43, fours: 4, sixes: 1, notOut: false },
        { player: "Babar Azam", runs: 41, balls: 33, fours: 3, sixes: 1, notOut: false },
        { player: "Shadab Khan", runs: 28, balls: 17, fours: 1, sixes: 2, notOut: true },
      ],
      bowlers: [
        { player: "Kagiso Rabada", overs: 4, maidens: 0, runs: 32, wickets: 2 },
        { player: "Anrich Nortje", overs: 4, maidens: 0, runs: 35, wickets: 2 },
        { player: "Lungi Ngidi", overs: 4, maidens: 0, runs: 29, wickets: 2 },
      ],
    },
    away: {
      nationId: "sa",
      runs: 148,
      wickets: 9,
      oversLabel: "(20)",
      batters: [
        { player: "Temba Bavuma", runs: 38, balls: 32, fours: 3, sixes: 1, notOut: false },
        { player: "Rassie van der Dussen", runs: 34, balls: 28, fours: 2, sixes: 1, notOut: false },
        { player: "Heinrich Klaasen", runs: 29, balls: 18, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Shaheen Shah Afridi", overs: 4, maidens: 0, runs: 27, wickets: 3 },
        { player: "Naseem Shah", overs: 4, maidens: 0, runs: 30, wickets: 3 },
        { player: "Haris Rauf", overs: 4, maidens: 0, runs: 33, wickets: 2 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-nz-eng",
    winnerNationId: "eng",
    winBy: { kind: "wickets", margin: 4 },
    home: {
      nationId: "nz",
      runs: 152,
      wickets: 8,
      oversLabel: "(20)",
      batters: [
        { player: "Finn Allen", runs: 42, balls: 26, fours: 3, sixes: 2, notOut: false },
        { player: "Kane Williamson", runs: 37, balls: 33, fours: 3, sixes: 0, notOut: false },
        { player: "Daryl Mitchell", runs: 31, balls: 24, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Sam Curran", overs: 4, maidens: 0, runs: 28, wickets: 3 },
        { player: "Chris Jordan", overs: 4, maidens: 0, runs: 31, wickets: 2 },
        { player: "Adil Rashid", overs: 4, maidens: 0, runs: 26, wickets: 2 },
      ],
    },
    away: {
      nationId: "eng",
      runs: 155,
      wickets: 6,
      oversLabel: "(19.1)",
      batters: [
        { player: "Alex Hales", runs: 48, balls: 32, fours: 4, sixes: 2, notOut: false },
        { player: "Jos Buttler", runs: 41, balls: 29, fours: 3, sixes: 1, notOut: true },
        { player: "Harry Brook", runs: 29, balls: 21, fours: 2, sixes: 1, notOut: false },
      ],
      bowlers: [
        { player: "Trent Boult", overs: 4, maidens: 0, runs: 30, wickets: 2 },
        { player: "Tim Southee", overs: 4, maidens: 0, runs: 33, wickets: 2 },
        { player: "Lockie Ferguson", overs: 4, maidens: 0, runs: 29, wickets: 1 },
      ],
    },
  },
  {
    fixtureId: "t20wc2022-wi-ire",
    winnerNationId: "wi",
    winBy: { kind: "runs", margin: 24 },
    home: {
      nationId: "wi",
      runs: 171,
      wickets: 6,
      oversLabel: "(20)",
      batters: [
        { player: "Nicholas Pooran", runs: 57, balls: 38, fours: 4, sixes: 3, notOut: false },
        { player: "Johnson Charles", runs: 39, balls: 27, fours: 3, sixes: 2, notOut: false },
        { player: "Rovman Powell", runs: 31, balls: 19, fours: 1, sixes: 2, notOut: true },
      ],
      bowlers: [
        { player: "Josh Little", overs: 4, maidens: 0, runs: 34, wickets: 2 },
        { player: "Mark Adair", overs: 4, maidens: 0, runs: 36, wickets: 2 },
        { player: "Gareth Delany", overs: 4, maidens: 0, runs: 29, wickets: 1 },
      ],
    },
    away: {
      nationId: "ire",
      runs: 147,
      wickets: 9,
      oversLabel: "(20)",
      batters: [
        { player: "Paul Stirling", runs: 44, balls: 33, fours: 4, sixes: 1, notOut: false },
        { player: "Lorcan Tucker", runs: 33, balls: 28, fours: 2, sixes: 1, notOut: false },
        { player: "Harry Tector", runs: 27, balls: 21, fours: 2, sixes: 0, notOut: false },
      ],
      bowlers: [
        { player: "Alzarri Joseph", overs: 4, maidens: 0, runs: 28, wickets: 3 },
        { player: "Odean Smith", overs: 4, maidens: 0, runs: 31, wickets: 3 },
        { player: "Akeal Hosein", overs: 4, maidens: 0, runs: 26, wickets: 2 },
      ],
    },
  },
];

function flagLogo(flagPath: string): Logo {
  return { url: flagPath, width: 640, height: 480 };
}

function deterministicGameId(fixtureId: string): string {
  return createHash("sha256").update(`weekend-results:${fixtureId}`).digest("hex").slice(0, 8);
}

export function formatWeekendResultsDate(isoDate: string): string {
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

function formatScore(wickets: number, runs: number): string {
  return `${wickets}/${runs}`;
}

function buildBatting(teamName: string, batters: SidePlan["batters"]): BattingPerformance[] {
  return batters.map((batter) => {
    if (batter.fours * 4 + batter.sixes * 6 > batter.runs) {
      throw new Error(`Boundaries exceed runs for ${batter.player}`);
    }
    return {
      player: batter.player,
      runs: batter.runs,
      balls: batter.balls,
      fours: batter.fours,
      sixes: batter.sixes,
      SR: strikeRateFromRunsAndBalls(batter.runs, batter.balls),
      team: teamName,
      notOut: batter.notOut,
    };
  });
}

function buildBowling(bowlingTeamName: string, bowlers: SidePlan["bowlers"]): BowlingPerformance[] {
  return bowlers.map((bowler) => {
    const oversText = Number.isInteger(bowler.overs) ? String(bowler.overs) : String(bowler.overs);
    const economy = economyFromRunsAndOvers(bowler.runs, oversText).toFixed(2);
    // Validate cricket overs notation for non-integers.
    legalDeliveriesFromOvers(oversText);
    return {
      player: bowler.player,
      overs: bowler.overs,
      maidens: bowler.maidens,
      runs: bowler.runs,
      wickets: bowler.wickets,
      economy,
      team: bowlingTeamName,
    };
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

export function generateWeekendResultsRows(
  manifest: CricketHistoricalDemoManifest,
): WeekendResultsRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const venuesById = new Map(manifest.venues.map((venue) => [venue.id, venue]));
  const fixturesById = new Map(manifest.fixtures.map((fixture) => [fixture.id, fixture]));
  const plansById = new Map(WEEKEND_RESULTS_SCORE_PLANS.map((plan) => [plan.fixtureId, plan]));

  return WEEKEND_RESULTS_FIXTURE_IDS.map((fixtureId) => {
    const fixture = fixturesById.get(fixtureId);
    const plan = plansById.get(fixtureId);
    if (!fixture || !plan) {
      throw new Error(`Missing weekend results fixture/plan ${fixtureId}`);
    }

    const homeNation = nationsById.get(fixture.homeNationId);
    const awayNation = nationsById.get(fixture.awayNationId);
    const venue = venuesById.get(fixture.venueId);
    if (!homeNation || !awayNation || !venue) {
      throw new Error(`Incomplete refs for weekend fixture ${fixtureId}`);
    }
    if (plan.home.nationId !== homeNation.id || plan.away.nationId !== awayNation.id) {
      throw new Error(`Score plan nations mismatch for ${fixtureId}`);
    }

    const homeName = homeNation.displayName;
    const awayName = awayNation.displayName;
    const homeLogo = flagLogo(homeNation.flagPath);
    const awayLogo = flagLogo(awayNation.flagPath);

    const homeBatting = buildBatting(homeName, plan.home.batters);
    const awayBatting = buildBatting(awayName, plan.away.batters);
    const homeBowling = buildBowling(awayName, plan.home.bowlers);
    const awayBowling = buildBowling(homeName, plan.away.bowlers);

    const winnerNation = nationsById.get(plan.winnerNationId);
    if (!winnerNation) {
      throw new Error(`Unknown winner ${plan.winnerNationId}`);
    }
    const winnerName = winnerNation.displayName;
    const loserName = winnerNation.id === homeNation.id ? awayName : homeName;

    if (plan.winBy.kind === "runs") {
      const margin = Math.abs(plan.home.runs - plan.away.runs);
      if (margin !== plan.winBy.margin) {
        throw new Error(`Runs margin mismatch for ${fixtureId}`);
      }
    } else {
      const winnerSide = plan.winnerNationId === homeNation.id ? plan.home : plan.away;
      if (10 - winnerSide.wickets !== plan.winBy.margin) {
        throw new Error(`Wickets margin mismatch for ${fixtureId}`);
      }
    }

    const result =
      plan.winBy.kind === "runs"
        ? `${winnerName} won by ${plan.winBy.margin} runs`
        : `${winnerName} won by ${plan.winBy.margin} wickets`;
    const resultShort = `${winnerName} def ${loserName}`;

    const homeTeam: TeamBlock = {
      name: homeName,
      isHome: true,
      logo: homeLogo,
      score: formatScore(plan.home.wickets, plan.home.runs),
      overs: plan.home.oversLabel,
      homeScoresFirstInnings: "1",
      battingPerformances: homeBatting,
      bowlingPerformances: homeBowling,
      isClubTeam: false,
    };
    const awayTeam: TeamBlock = {
      name: awayName,
      isHome: false,
      logo: awayLogo,
      score: formatScore(plan.away.wickets, plan.away.runs),
      overs: plan.away.oversLabel,
      awayScoresFirstInnings: "1",
      battingPerformances: awayBatting,
      bowlingPerformances: awayBowling,
      isClubTeam: false,
    };

    const promptObject = {
      matchContext: {
        competition: WEEKEND_RESULTS_COMPETITION,
        grade: WEEKEND_RESULTS_GRADE,
        round: WEEKEND_RESULTS_GRADE,
        ground: venue.displayName,
        matchType: "T20",
        tossWinner: homeName,
        tossResult: `${homeName} won the toss and elected to bat`,
        resultStatement: result,
        dayOne: fixture.date,
        finalDaysPlay: fixture.date,
        note: "Fictional demonstration scorecard for archive preview only.",
      },
      homeTeam: {
        teamName: homeName,
        innings: [
          {
            teamName: homeName,
            score: "",
            overs: "",
            wickets: plan.home.wickets,
            battingOrder: homeBatting.map((row) => ({ description: battingDescription(row) })),
            bowlingFigures: homeBowling.map((row) => ({ description: bowlingDescription(row) })),
            fieldingStats: [],
            fallOfWickets: [],
            inningsNumber: 1,
            inningsName: `${homeName} Batting`,
          },
        ],
        totalScore: String(plan.home.runs),
        totalWickets: plan.home.wickets,
      },
      awayTeam: {
        teamName: awayName,
        innings: [
          {
            teamName: awayName,
            score: "",
            overs: "",
            wickets: plan.away.wickets,
            battingOrder: awayBatting.map((row) => ({ description: battingDescription(row) })),
            bowlingFigures: awayBowling.map((row) => ({ description: bowlingDescription(row) })),
            fieldingStats: [],
            fallOfWickets: [],
            inningsNumber: 1,
            inningsName: `${awayName} Batting`,
          },
        ],
        totalScore: String(plan.away.runs),
        totalWickets: plan.away.wickets,
      },
    };

    return {
      gameID: deterministicGameId(fixtureId),
      status: "Final",
      homeTeam,
      awayTeam,
      teamHomeLogo: homeLogo,
      teamAwayLogo: awayLogo,
      date: formatWeekendResultsDate(fixture.date),
      type: "T20",
      ground: venue.displayName,
      round: WEEKEND_RESULTS_GRADE,
      gender: "Men",
      ageGroup: "Senior",
      gradeName: WEEKEND_RESULTS_GRADE,
      gradeSortOrder: 0,
      ...emptyDemoContentRowSponsorFields(),
      result,
      resultShort,
      resultSummary: {
        homeTeam: homeName,
        awayTeam: awayName,
        winner: winnerName,
        resultWord: "won",
      },
      prompt: JSON.stringify(promptObject, null, 2),
    };
  });
}

export function sanitiseWeekendResultsVideoMeta(
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

export function buildSanitisedWeekendResultsDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: WeekendResultsRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: string;
  };
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_WEEKEND_RESULTS_TIMINGS;
  frames: number[];
  videoMeta: Record<string, unknown>;
  errors: [];
} {
  const data = generateWeekendResultsRows(args.manifest);
  if (data.length !== 9) {
    throw new Error(`Expected 9 weekend results, got ${data.length}`);
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
    timings: { ...PRESERVED_WEEKEND_RESULTS_TIMINGS },
    frames: [...PRESERVED_WEEKEND_RESULTS_FRAMES],
    videoMeta: sanitiseWeekendResultsVideoMeta(args.existingVideoMeta),
    errors: [],
  };
}
