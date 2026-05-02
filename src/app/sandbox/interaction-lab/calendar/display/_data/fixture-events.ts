import type { CalendarDisplayEvent } from "../_types/fixture-calendar.types";

type WeekendRound = {
  roundNumber: number;
  saturday: string;
  sunday: string;
  mondayBundleDate: string;
};

type Matchup = {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  organisation: string;
  spansWeekend?: boolean;
};

const competition = "Coastal Championship";
const bundleOrganisation = "North Coast Cricket Club";

const weekendRounds: WeekendRound[] = [
  { roundNumber: 1, saturday: "2026-04-04", sunday: "2026-04-05", mondayBundleDate: "2026-04-06" },
  { roundNumber: 2, saturday: "2026-04-11", sunday: "2026-04-12", mondayBundleDate: "2026-04-13" },
  { roundNumber: 3, saturday: "2026-04-18", sunday: "2026-04-19", mondayBundleDate: "2026-04-20" },
  { roundNumber: 4, saturday: "2026-04-25", sunday: "2026-04-26", mondayBundleDate: "2026-04-27" },
  { roundNumber: 5, saturday: "2026-05-02", sunday: "2026-05-03", mondayBundleDate: "2026-05-04" },
  { roundNumber: 6, saturday: "2026-05-09", sunday: "2026-05-10", mondayBundleDate: "2026-05-11" },
  { roundNumber: 7, saturday: "2026-05-16", sunday: "2026-05-17", mondayBundleDate: "2026-05-18" },
  { roundNumber: 8, saturday: "2026-05-23", sunday: "2026-05-24", mondayBundleDate: "2026-05-25" },
  { roundNumber: 9, saturday: "2026-05-30", sunday: "2026-05-31", mondayBundleDate: "2026-06-01" },
  { roundNumber: 10, saturday: "2026-06-06", sunday: "2026-06-07", mondayBundleDate: "2026-06-08" },
  { roundNumber: 11, saturday: "2026-06-13", sunday: "2026-06-14", mondayBundleDate: "2026-06-15" },
  { roundNumber: 12, saturday: "2026-06-20", sunday: "2026-06-21", mondayBundleDate: "2026-06-22" },
  { roundNumber: 13, saturday: "2026-06-27", sunday: "2026-06-28", mondayBundleDate: "2026-06-29" },
  { roundNumber: 14, saturday: "2026-07-04", sunday: "2026-07-05", mondayBundleDate: "2026-07-06" },
  { roundNumber: 15, saturday: "2026-07-11", sunday: "2026-07-12", mondayBundleDate: "2026-07-13" },
  { roundNumber: 16, saturday: "2026-07-18", sunday: "2026-07-19", mondayBundleDate: "2026-07-20" },
  { roundNumber: 17, saturday: "2026-07-25", sunday: "2026-07-26", mondayBundleDate: "2026-07-27" },
];

const firstGradeMatchups: Matchup[] = [
  {
    homeTeam: "Norths",
    awayTeam: "Souths",
    venue: "Main Oval",
    organisation: "North Coast Cricket Club",
    spansWeekend: true,
  },
  {
    homeTeam: "Easts",
    awayTeam: "Wests",
    venue: "Showground Oval",
    organisation: "Coastal Cricket Association",
  },
  {
    homeTeam: "Bears",
    awayTeam: "Panthers",
    venue: "Harbour Park",
    organisation: "Harbour District Cricket",
  },
  {
    homeTeam: "Lions",
    awayTeam: "Comets",
    venue: "Riverside Ground",
    organisation: "River City Cricket Club",
  },
  {
    homeTeam: "Waves",
    awayTeam: "Royals",
    venue: "Seaside Reserve",
    organisation: "Coastal Cricket Association",
    spansWeekend: true,
  },
  {
    homeTeam: "Falcons",
    awayTeam: "Rangers",
    venue: "Falcon Field",
    organisation: "Falcon Cricket Club",
  },
];

const reserveGradeMatchups: Matchup[] = [
  {
    homeTeam: "Sharks",
    awayTeam: "Tigers",
    venue: "North Field",
    organisation: "North Coast Cricket Club",
  },
  {
    homeTeam: "Rangers",
    awayTeam: "United",
    venue: "Harbour Park",
    organisation: "Coastal Cricket Association",
  },
  {
    homeTeam: "Mariners",
    awayTeam: "Jets",
    venue: "South Park",
    organisation: "Mariners Cricket Club",
  },
  {
    homeTeam: "Dolphins",
    awayTeam: "Kings",
    venue: "Dolphin Oval",
    organisation: "Harbour District Cricket",
  },
  {
    homeTeam: "Lions",
    awayTeam: "Comets",
    venue: "Training Oval",
    organisation: "River City Cricket Club",
  },
  {
    homeTeam: "Falcons",
    awayTeam: "Mariners",
    venue: "Falcon Field",
    organisation: "Falcon Cricket Club",
  },
];

const under18Matchups: Matchup[] = [
  {
    homeTeam: "Falcons",
    awayTeam: "Eagles",
    venue: "Junior Oval 1",
    organisation: "North Coast Cricket Club",
  },
  {
    homeTeam: "Wolves",
    awayTeam: "Royals",
    venue: "Junior Oval 2",
    organisation: "Coastal Cricket Association",
  },
  {
    homeTeam: "Hawks",
    awayTeam: "Storm",
    venue: "Junior Oval 3",
    organisation: "Harbour District Cricket",
  },
  {
    homeTeam: "Rockets",
    awayTeam: "Kings",
    venue: "Junior Oval 4",
    organisation: "River City Cricket Club",
  },
  {
    homeTeam: "Tigers",
    awayTeam: "Eagles",
    venue: "Junior Oval 5",
    organisation: "Falcon Cricket Club",
  },
  {
    homeTeam: "Sharks",
    awayTeam: "Panthers",
    venue: "Junior Oval 6",
    organisation: "Mariners Cricket Club",
  },
];

function matchupAt(matchups: Matchup[], index: number): Matchup {
  return matchups[index % matchups.length]!;
}

function createFixtureEvent(
  id: string,
  roundNumber: number,
  grade: string,
  matchup: Matchup,
  saturday: string,
  sunday: string,
): CalendarDisplayEvent {
  const round = `Round ${roundNumber}`;

  if (matchup.spansWeekend) {
    return {
      id,
      title: `${grade}: ${matchup.homeTeam} vs ${matchup.awayTeam}`,
      date: saturday,
      start: `${saturday}T09:30:00`,
      end: `${sunday}T16:00:00`,
      eventType: "fixture",
      extendedProps: {
        grade,
        competition,
        homeTeam: matchup.homeTeam,
        awayTeam: matchup.awayTeam,
        venue: matchup.venue,
        status: "scheduled",
        round,
        organisation: matchup.organisation,
        notes: "Two-day fixture used to test spanning weekend rendering.",
      },
    };
  }

  const fixtureDate = grade === "Under 18" ? sunday : saturday;
  const fixtureStartTime = grade === "Under 18" ? "10:00:00" : "13:00:00";

  return {
    id,
    title: `${grade}: ${matchup.homeTeam} vs ${matchup.awayTeam}`,
    date: fixtureDate,
    start: `${fixtureDate}T${fixtureStartTime}`,
    allDay: false,
    eventType: "fixture",
    extendedProps: {
      grade,
      competition,
      homeTeam: matchup.homeTeam,
      awayTeam: matchup.awayTeam,
      venue: matchup.venue,
      status: "scheduled",
      round,
      organisation: matchup.organisation,
    },
  };
}

const fixtureSeasonEvents = weekendRounds.flatMap((weekendRound, index) => {
  const primaryFirstGrade = matchupAt(firstGradeMatchups, index);
  const secondaryFirstGrade = matchupAt(firstGradeMatchups, index + 1);
  const primaryReserveGrade = matchupAt(reserveGradeMatchups, index);
  const secondaryReserveGrade = matchupAt(reserveGradeMatchups, index + 2);
  const primaryUnder18 = matchupAt(under18Matchups, index);
  const secondaryUnder18 = matchupAt(under18Matchups, index + 3);

  return [
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-fg-a`,
      weekendRound.roundNumber,
      "First Grade",
      primaryFirstGrade,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-fg-b`,
      weekendRound.roundNumber,
      "First Grade",
      secondaryFirstGrade,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-rg-a`,
      weekendRound.roundNumber,
      "Reserve Grade",
      primaryReserveGrade,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-rg-b`,
      weekendRound.roundNumber,
      "Reserve Grade",
      secondaryReserveGrade,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-u18-a`,
      weekendRound.roundNumber,
      "Under 18",
      primaryUnder18,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
    createFixtureEvent(
      `fixture-${weekendRound.roundNumber.toString().padStart(3, "0")}-u18-b`,
      weekendRound.roundNumber,
      "Under 18",
      secondaryUnder18,
      weekendRound.saturday,
      weekendRound.sunday,
    ),
  ];
});

const bundleProductionEvents: CalendarDisplayEvent[] = weekendRounds.map((weekendRound) => ({
  id: `bundle-${weekendRound.roundNumber.toString().padStart(3, "0")}`,
  title: "Bundle created",
  date: weekendRound.mondayBundleDate,
  start: `${weekendRound.mondayBundleDate}T09:00:00`,
  eventType: "bundle-production",
  extendedProps: {
    bundleName: `Round ${weekendRound.roundNumber} Results Pack`,
    bundleHref: `https://example.com/bundles/round-${weekendRound.roundNumber}`,
    productionWindow: "Monday morning",
    deliverable: "Weekend recap bundle",
    channel: weekendRound.roundNumber % 2 === 0 ? "Website and Facebook" : "Instagram and Facebook",
    status:
      weekendRound.roundNumber % 3 === 0
        ? "complete"
        : weekendRound.roundNumber % 2 === 0
          ? "processing"
          : "pending",
    organisation: bundleOrganisation,
    notes: `Bundle created on the Monday after round ${weekendRound.roundNumber}.`,
    renderCount: 16 + weekendRound.roundNumber,
  },
}));

export const fixtureEvents: CalendarDisplayEvent[] = [
  ...fixtureSeasonEvents,
  ...bundleProductionEvents,
];
