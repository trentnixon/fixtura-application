import { createHash } from "node:crypto";

import { sanitiseLadderVideoMeta } from "./generate-ladder-dataset";
import {
  emptyDemoContentRowSponsorFields,
  type DemoContentRowSponsorFields,
} from "../utils/sponsors-payload-v2";

import type { CricketHistoricalDemoManifest } from "./schema";

export const PRESERVED_UPCOMING_FRAMES = [45, 195, 390] as const;

export const PRESERVED_UPCOMING_TIMINGS = {
  FPS_MAIN: 405,
  FPS_INTRO: 90,
  FPS_OUTRO: 30,
  FPS_LADDER: 0,
  FPS_SCORECARD: 210,
} as const;

export const UPCOMING_GRADE_NAME = "2019 World Cup — Group Stage";
export const UPCOMING_ROUND = "2019 World Cup — Group Stage";

/** Canonical display order from the Monday upcoming subitem. */
export const UPCOMING_FIXTURE_IDS_IN_ORDER = [
  "cwc2019-eng-sa",
  "cwc2019-wi-pak",
  "cwc2019-nz-sl",
  "cwc2019-afg-aus",
  "cwc2019-ind-sa",
  "cwc2019-ban-nz",
] as const;

const DAY_START_TIMES: Record<string, string> = {
  "cwc2019-eng-sa": "10:30 AM",
  "cwc2019-wi-pak": "10:30 AM",
  "cwc2019-nz-sl": "10:30 AM",
  "cwc2019-afg-aus": "02:00 PM",
  "cwc2019-ind-sa": "10:30 AM",
  "cwc2019-ban-nz": "01:30 PM",
};

export type UpcomingFixtureRow = {
  date: string;
  time: string;
  type: string;
  round: string;
  gameID: string;
  gender: string;
  ground: string;
  prompt: string;
  ageGroup: string;
  teamAway: string;
  teamHome: string;
  gradeName: string;
  teamAwayLogo: { url: string; width: number; height: number };
  teamHomeLogo: { url: string; width: number; height: number };
} & DemoContentRowSponsorFields;

function formatUpcomingDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
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
  return `${days[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

function formatLongDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function deterministicGameId(fixtureId: string): string {
  return createHash("sha256").update(`upcoming:${fixtureId}`).digest("hex").slice(0, 8);
}

function flagLogo(flagPath: string): { url: string; width: number; height: number } {
  return { url: flagPath, width: 640, height: 480 };
}

export function generateUpcomingRows(
  manifest: CricketHistoricalDemoManifest,
): UpcomingFixtureRow[] {
  const nationsById = new Map(manifest.nations.map((nation) => [nation.id, nation]));
  const venuesById = new Map(manifest.venues.map((venue) => [venue.id, venue]));
  const fixturesById = new Map(manifest.fixtures.map((fixture) => [fixture.id, fixture]));

  return UPCOMING_FIXTURE_IDS_IN_ORDER.map((fixtureId) => {
    const fixture = fixturesById.get(fixtureId);
    if (!fixture) {
      throw new Error(`Missing upcoming fixture ${fixtureId} in manifest`);
    }
    const home = nationsById.get(fixture.homeNationId);
    const away = nationsById.get(fixture.awayNationId);
    const venue = venuesById.get(fixture.venueId);
    if (!home || !away || !venue) {
      throw new Error(`Incomplete refs for fixture ${fixtureId}`);
    }

    const time = DAY_START_TIMES[fixtureId] ?? "10:30 AM";
    const date = formatUpcomingDate(fixture.date);
    const longDate = formatLongDate(fixture.date);
    const ground = venue.displayName;

    const prompt = [
      "Archive preview — upcoming cricket fixture:",
      `- Teams: ${home.displayName} vs ${away.displayName}`,
      `- Date and Time: ${longDate}, ${time}`,
      `- Location: ${ground}`,
      `- Round: ${UPCOMING_ROUND}`,
      `- Match Type: One Day`,
      `- League: ${UPCOMING_GRADE_NAME}`,
    ].join("\n");

    return {
      date,
      time,
      type: "One Day",
      round: UPCOMING_ROUND,
      gameID: deterministicGameId(fixtureId),
      gender: "Men",
      ground,
      prompt,
      ageGroup: "Senior",
      teamAway: away.displayName,
      teamHome: home.displayName,
      gradeName: UPCOMING_GRADE_NAME,
      teamAwayLogo: flagLogo(away.flagPath),
      teamHomeLogo: flagLogo(home.flagPath),
      ...emptyDemoContentRowSponsorFields(),
    };
  });
}

export function sanitiseUpcomingVideoMeta(
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

export function buildSanitisedUpcomingDataset(args: {
  manifest: CricketHistoricalDemoManifest;
  existingVideoMeta: Record<string, unknown>;
}): {
  data: UpcomingFixtureRow[];
  asset: {
    assetID: number;
    assetTypeID: number;
    assetCategoryID: number;
    assetsLinkID: number;
  };
  errors: [];
  frames: number[];
  render: { schedulerId: number; renderId: number };
  account: { accountId: number };
  timings: typeof PRESERVED_UPCOMING_TIMINGS;
  videoMeta: Record<string, unknown>;
} {
  const data = generateUpcomingRows(args.manifest);
  if (data.length !== 6) {
    throw new Error(`Expected 6 upcoming fixtures, got ${data.length}`);
  }

  return {
    data,
    asset: {
      assetID: 0,
      assetTypeID: 0,
      assetCategoryID: 0,
      assetsLinkID: 0,
    },
    errors: [],
    frames: [...PRESERVED_UPCOMING_FRAMES],
    render: {
      schedulerId: 0,
      renderId: 0,
    },
    account: {
      accountId: 0,
    },
    timings: { ...PRESERVED_UPCOMING_TIMINGS },
    videoMeta: sanitiseUpcomingVideoMeta(args.existingVideoMeta),
  };
}
