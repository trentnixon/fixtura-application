import { SEASON_GRADE_FIXTURE_STATUS_EMPTY } from "../_constants";
import { resolveCompetitionTitle } from "./season-competition";
import { parseGradePayloadCounts } from "./season-grade";
import { asRecord, pickString } from "./season-record";

import type {
  SeasonGradeDisplayModel,
  SeasonGradeFixtureFilterOptions,
  SeasonGradeFixtureFilterValues,
  UnknownRecord,
} from "../_types";
import type { SeasonHubFixtureListItem } from "@/types/api/season-hub";

export function buildSeasonGradeDisplayModel({
  gradeRaw,
  gradeId,
  competitionId,
  fixtureRowCount,
}: {
  gradeRaw: UnknownRecord | undefined;
  gradeId: string;
  competitionId: string;
  fixtureRowCount: number;
}): SeasonGradeDisplayModel {
  const topLine = gradeRaw ? asRecord(gradeRaw["topLineData"]) : undefined;
  const competitionData = gradeRaw ? asRecord(gradeRaw["competitionData"]) : undefined;
  const meta = gradeRaw ? asRecord(gradeRaw["meta"]) : undefined;
  const competitionNested = gradeRaw ? asRecord(gradeRaw["competition"]) : undefined;
  const association = gradeRaw ? asRecord(gradeRaw["association"]) : undefined;
  const associationFromCompetition = competitionData
    ? asRecord(competitionData["association"])
    : undefined;

  const competitionBreadcrumbLabel =
    (competitionData ? pickString(competitionData, ["competitionName"]) : undefined) ??
    resolveCompetitionTitle(gradeRaw, competitionId);

  const displayName =
    (topLine ? pickString(topLine, ["gradeName"]) : undefined) ??
    (gradeRaw ? pickString(gradeRaw, ["name"]) : undefined) ??
    `Grade ${gradeId}`;

  const status =
    (competitionData ? pickString(competitionData, ["status"]) : undefined) ??
    (competitionNested ? pickString(competitionNested, ["status"]) : undefined) ??
    (meta ? pickString(meta, ["status"]) : undefined) ??
    "Unknown status";

  const { teams: teamsFromPayload, fixtures: fixturesFromPayload } =
    parseGradePayloadCounts(gradeRaw);
  const teamCount = teamsFromPayload;
  const fixtureCountListed = fixtureRowCount;
  const fixtureCount = fixturesFromPayload > 0 ? fixturesFromPayload : fixtureCountListed;

  const season =
    (competitionData ? pickString(competitionData, ["season"]) : undefined) ??
    (meta ? pickString(meta, ["season"]) : undefined);
  const associationName =
    (associationFromCompetition ? pickString(associationFromCompetition, ["name"]) : undefined) ??
    (association ? pickString(association, ["name"]) : undefined);
  const headerContextParts = [season, associationName].filter((p): p is string =>
    Boolean(p && p.length > 0),
  );
  const headerContextLine = headerContextParts.length > 0 ? headerContextParts.join(" - ") : null;

  const headerGradeMetaParts = [
    topLine ? pickString(topLine, ["gender"]) : undefined,
    topLine ? pickString(topLine, ["ageGroup"]) : undefined,
    topLine ? pickString(topLine, ["daysPlayed"]) : undefined,
  ].filter((p): p is string => Boolean(p && p.length > 0));
  const headerGradeMetaLine =
    headerGradeMetaParts.length > 0 ? headerGradeMetaParts.join(" - ") : null;

  const competitionIsActive = competitionData?.["isActive"];
  const gradeHeaderActive =
    typeof competitionIsActive === "boolean" ? competitionIsActive : /\bactive\b/i.test(status);

  return {
    competitionBreadcrumbLabel,
    displayName,
    status,
    teamCount,
    fixtureCount,
    headerContextLine,
    headerGradeMetaLine,
    gradeHeaderActive,
  };
}

export function buildSeasonGradeFixtureFilterOptions(
  rows: SeasonHubFixtureListItem[],
): SeasonGradeFixtureFilterOptions {
  const teamSet = new Set<string>();
  const venueSet = new Set<string>();
  const dateSet = new Set<string>();
  const statusEntries = new Map<string, string>();

  for (const f of rows) {
    const h = f.teams.home?.trim();
    const a = f.teams.away?.trim();
    if (h) {
      teamSet.add(h);
    }
    if (a) {
      teamSet.add(a);
    }
    const v = f.venue.ground?.trim();
    if (v) {
      venueSet.add(v);
    }
    const d = f.date?.trim();
    if (d) {
      dateSet.add(d);
    }
    const st = f.status?.trim() ?? "";
    if (st.length > 0) {
      statusEntries.set(st, st);
    } else {
      statusEntries.set(SEASON_GRADE_FIXTURE_STATUS_EMPTY, "No status");
    }
  }

  const sortLocale = (x: string, y: string) =>
    x.localeCompare(y, undefined, { sensitivity: "base" });

  const sortedTeams = [...teamSet].sort(sortLocale);
  const sortedVenues = [...venueSet].sort(sortLocale);
  const sortedDates = [...dateSet].sort((x, y) => {
    const tx = new Date(x).getTime();
    const ty = new Date(y).getTime();
    if (!Number.isNaN(tx) && !Number.isNaN(ty) && tx !== ty) {
      return tx - ty;
    }
    return sortLocale(x, y);
  });
  const sortedStatuses = [...statusEntries.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], undefined, { sensitivity: "base" }),
  );

  return {
    teams: sortedTeams,
    venues: sortedVenues,
    dates: sortedDates,
    statuses: sortedStatuses,
  };
}

export function filterSeasonGradeFixtureRows(
  rows: SeasonHubFixtureListItem[],
  filters: SeasonGradeFixtureFilterValues,
  filterAllValue: string,
  statusEmptyValue: string,
): SeasonHubFixtureListItem[] {
  const normalizedFixtureSearch = filters.search.trim().toLocaleLowerCase();

  return rows.filter((fixture) => {
    if (normalizedFixtureSearch.length > 0) {
      const searchable = [
        fixture.teams.home ?? "",
        fixture.teams.away ?? "",
        fixture.round ?? "",
        fixture.date ?? "",
        fixture.status ?? "",
        fixture.type ?? "",
        fixture.venue.ground ?? "",
        String(fixture.id),
      ]
        .join(" ")
        .toLocaleLowerCase();
      if (!searchable.includes(normalizedFixtureSearch)) {
        return false;
      }
    }

    if (filters.team !== filterAllValue) {
      const home = fixture.teams.home?.trim() ?? "";
      const away = fixture.teams.away?.trim() ?? "";
      if (home !== filters.team && away !== filters.team) {
        return false;
      }
    }

    if (filters.venue !== filterAllValue) {
      const ground = fixture.venue.ground?.trim() ?? "";
      if (ground !== filters.venue) {
        return false;
      }
    }

    if (filters.date !== filterAllValue) {
      const raw = fixture.date?.trim() ?? "";
      if (raw !== filters.date) {
        return false;
      }
    }

    if (filters.status !== filterAllValue) {
      const st = fixture.status?.trim() ?? "";
      if (filters.status === statusEmptyValue) {
        if (st.length > 0) {
          return false;
        }
      } else if (st !== filters.status) {
        return false;
      }
    }

    return true;
  });
}
