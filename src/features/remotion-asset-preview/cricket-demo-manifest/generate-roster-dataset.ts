import { createHash } from "node:crypto";

import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_ROSTER_FRAMES = [
  120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720,
] as const;

export const PRESERVED_ROSTER_TIMINGS = {
  FPS_MAIN: 660,
  FPS_INTRO: 90,
  FPS_OUTRO: 180,
  FPS_LADDER: 0,
  FPS_SCORECARD: 60,
} as const;

export const ROSTER_GRADE_NAME = "2022 T20 World Cup";
export const ROSTER_POOL_ID = "pool-t20wc-2022-rosters";

/**
 * Binding order + which side the XI represents (Monday roster brief).
 * isHomeTeam must match the side that owns teamRoster.
 */
export const ROSTER_FIXTURE_PLANS = [
  { fixtureId: "t20wc2022-sl-nam", rosterNationId: "sl", isHomeTeam: true, round: "First Round" },
  { fixtureId: "t20wc2022-wi-ire", rosterNationId: "ire", isHomeTeam: false, round: "First Round" },
  { fixtureId: "t20wc2022-aus-nz", rosterNationId: "aus", isHomeTeam: true, round: "Super 12" },
  { fixtureId: "t20wc2022-eng-afg", rosterNationId: "afg", isHomeTeam: false, round: "Super 12" },
  { fixtureId: "t20wc2022-ind-pak", rosterNationId: "ind", isHomeTeam: true, round: "Super 12" },
  { fixtureId: "t20wc2022-sa-ban", rosterNationId: "ban", isHomeTeam: false, round: "Super 12" },
  { fixtureId: "t20wc2022-ire-eng", rosterNationId: "eng", isHomeTeam: false, round: "Super 12" },
  { fixtureId: "t20wc2022-nz-sl", rosterNationId: "nz", isHomeTeam: true, round: "Super 12" },
  { fixtureId: "t20wc2022-zim-pak", rosterNationId: "pak", isHomeTeam: false, round: "Super 12" },
  { fixtureId: "t20wc2022-ban-ind", rosterNationId: "ban", isHomeTeam: true, round: "Super 12" },
  { fixtureId: "t20wc2022-aus-afg", rosterNationId: "afg", isHomeTeam: false, round: "Super 12" },
] as const;

/**
 * Historical 2022 Men's T20 World Cup XI selections (demo display).
 * Captain / keeper encoded with newline suffixes matching source Remotion data.
 */
export const ROSTER_SQUADS: Record<string, readonly string[]> = {
  sl: [
    "Dasun Shanaka\nc",
    "Pathum Nissanka",
    "Kusal Mendis\nwk",
    "Charith Asalanka",
    "Bhanuka Rajapaksa",
    "Dhananjaya de Silva",
    "Wanindu Hasaranga",
    "Chamika Karunaratne",
    "Maheesh Theekshana",
    "Lahiru Kumara",
    "Dilshan Madushanka",
  ],
  ire: [
    "Andrew Balbirnie\nc",
    "Paul Stirling",
    "Lorcan Tucker\nwk",
    "Harry Tector",
    "Curtis Campher",
    "George Dockrell",
    "Gareth Delany",
    "Mark Adair",
    "Josh Little",
    "Barry McCarthy",
    "Simi Singh",
  ],
  aus: [
    "Aaron Finch\nc",
    "David Warner",
    "Mitchell Marsh",
    "Glenn Maxwell",
    "Marcus Stoinis",
    "Steven Smith",
    "Matthew Wade\nwk",
    "Pat Cummins",
    "Mitchell Starc",
    "Adam Zampa",
    "Josh Hazlewood",
  ],
  afg: [
    "Mohammad Nabi\nc",
    "Hazratullah Zazai",
    "Rahmanullah Gurbaz\nwk",
    "Ibrahim Zadran",
    "Najibullah Zadran",
    "Rashid Khan",
    "Azmatullah Omarzai",
    "Mujeeb Ur Rahman",
    "Fazalhaq Farooqi",
    "Naveen-ul-Haq",
    "Fareed Ahmad",
  ],
  ind: [
    "Rohit Sharma\nc",
    "KL Rahul",
    "Virat Kohli",
    "Suryakumar Yadav",
    "Hardik Pandya",
    "Rishabh Pant\nwk",
    "Ravindra Jadeja",
    "Axar Patel",
    "Bhuvneshwar Kumar",
    "Mohammed Shami",
    "Arshdeep Singh",
  ],
  ban: [
    "Shakib Al Hasan\nc",
    "Litton Das\nwk",
    "Najmul Hossain Shanto",
    "Afif Hossain",
    "Mosaddek Hossain",
    "Yasir Ali",
    "Nurul Hasan",
    "Mehidy Hasan Miraz",
    "Taskin Ahmed",
    "Mustafizur Rahman",
    "Hasan Mahmud",
  ],
  eng: [
    "Jos Buttler\nc",
    "Alex Hales",
    "Dawid Malan",
    "Ben Stokes",
    "Harry Brook",
    "Moeen Ali",
    "Sam Curran",
    "Chris Woakes",
    "Adil Rashid",
    "Mark Wood",
    "Chris Jordan",
  ],
  nz: [
    "Kane Williamson\nc",
    "Finn Allen",
    "Devon Conway\nwk",
    "Glenn Phillips",
    "Daryl Mitchell",
    "Jimmy Neesham",
    "Mitchell Santner",
    "Ish Sodhi",
    "Tim Southee",
    "Lockie Ferguson",
    "Trent Boult",
  ],
  pak: [
    "Babar Azam\nc",
    "Mohammad Rizwan\nwk",
    "Shan Masood",
    "Iftikhar Ahmed",
    "Shadab Khan",
    "Mohammad Nawaz",
    "Shaheen Shah Afridi",
    "Haris Rauf",
    "Naseem Shah",
    "Mohammad Wasim",
    "Asif Ali",
  ],
};

export type RosterFixtureRow = {
  date: string;
  type: string;
  round: string;
  gameId: string;
  gender: string;
  ground: string;
  ageGroup: string;
  sponsors: [];
  teamAway: string;
  teamHome: string;
  gradeName: string;
  isHomeTeam: boolean;
  teamRoster: string[];
  teamAwayLogo: string;
  teamHomeLogo: string;
};

function deterministicGameId(fixtureId: string): string {
  return createHash("sha256").update(`roster:${fixtureId}`).digest("hex").slice(0, 8);
}

export function formatRosterDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function encodeRosterPlayerName(name: string, role?: "c" | "wk" | "vc"): string {
  if (!role) {
    return name;
  }
  return `${name}\n${role}`;
}

export function generateRosterRows(manifest: CricketHistoricalDemoManifest): RosterFixtureRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const venuesById = new Map(manifest.venues.map((venue) => [venue.id, venue]));
  const fixturesById = new Map(manifest.fixtures.map((fixture) => [fixture.id, fixture]));

  for (const plan of ROSTER_FIXTURE_PLANS) {
    const squad = ROSTER_SQUADS[plan.rosterNationId];
    if (!squad || squad.length !== 11) {
      throw new Error(`Expected 11-player squad for ${plan.rosterNationId}`);
    }
  }

  return ROSTER_FIXTURE_PLANS.map((plan) => {
    const fixture = fixturesById.get(plan.fixtureId);
    if (!fixture) {
      throw new Error(`Missing roster fixture ${plan.fixtureId}`);
    }

    const home = nationsById.get(fixture.homeNationId);
    const away = nationsById.get(fixture.awayNationId);
    const venue = venuesById.get(fixture.venueId);
    const rosterNation = nationsById.get(plan.rosterNationId);
    if (!home || !away || !venue || !rosterNation) {
      throw new Error(`Incomplete refs for roster fixture ${plan.fixtureId}`);
    }

    const expectedRosterSide = plan.isHomeTeam ? home.id : away.id;
    if (expectedRosterSide !== plan.rosterNationId) {
      throw new Error(
        `isHomeTeam/rosterNation mismatch for ${plan.fixtureId}: expected ${expectedRosterSide}`,
      );
    }

    const squad = ROSTER_SQUADS[plan.rosterNationId]!;
    return {
      date: formatRosterDate(fixture.date),
      type: "T20",
      round: `${ROSTER_GRADE_NAME} — ${plan.round}`,
      gameId: deterministicGameId(plan.fixtureId),
      gender: "Men",
      ground: venue.displayName,
      ageGroup: "Senior",
      sponsors: [],
      teamAway: away.displayName,
      teamHome: home.displayName,
      gradeName: ROSTER_GRADE_NAME,
      isHomeTeam: plan.isHomeTeam,
      teamRoster: [...squad],
      teamAwayLogo: away.flagPath,
      teamHomeLogo: home.flagPath,
    };
  });
}

export function sanitiseRosterVideoMeta(
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

export function buildSanitisedRosterDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: RosterFixtureRow[];
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
  timings: typeof PRESERVED_ROSTER_TIMINGS;
  videoMeta: Record<string, unknown>;
} {
  const data = generateRosterRows(args.manifest);
  if (data.length !== 11) {
    throw new Error(`Expected 11 roster fixtures, got ${data.length}`);
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
    frames: [...PRESERVED_ROSTER_FRAMES],
    render: {
      schedulerId: 0,
      renderId: 0,
    },
    account: {
      accountId: 0,
    },
    timings: { ...PRESERVED_ROSTER_TIMINGS },
    videoMeta: sanitiseRosterVideoMeta(args.existingVideoMeta),
  };
}
