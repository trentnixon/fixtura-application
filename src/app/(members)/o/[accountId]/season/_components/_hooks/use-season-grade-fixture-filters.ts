"use client";

import { useMemo, useState } from "react";

import { SEASON_FILTER_ALL, SEASON_GRADE_FIXTURE_STATUS_EMPTY } from "../_constants";
import { buildSeasonGradeFixtureFilterOptions, filterSeasonGradeFixtureRows } from "../_utils";

import type { SeasonHubFixtureListItem } from "@/types/api/season-hub";

type UseSeasonGradeFixtureFiltersArgs = {
  rows: SeasonHubFixtureListItem[];
};

export function useSeasonGradeFixtureFilters({ rows }: UseSeasonGradeFixtureFiltersArgs) {
  const [team, setTeam] = useState<string>(SEASON_FILTER_ALL);
  const [venue, setVenue] = useState<string>(SEASON_FILTER_ALL);
  const [date, setDate] = useState<string>(SEASON_FILTER_ALL);
  const [status, setStatus] = useState<string>(SEASON_FILTER_ALL);

  const options = useMemo(() => buildSeasonGradeFixtureFilterOptions(rows), [rows]);

  const filteredRows = useMemo(
    () =>
      filterSeasonGradeFixtureRows(
        rows,
        { team, venue, date, status },
        SEASON_FILTER_ALL,
        SEASON_GRADE_FIXTURE_STATUS_EMPTY,
      ),
    [rows, team, venue, date, status],
  );

  const hasActiveFilters =
    team !== SEASON_FILTER_ALL ||
    venue !== SEASON_FILTER_ALL ||
    date !== SEASON_FILTER_ALL ||
    status !== SEASON_FILTER_ALL;

  const clearFilters = () => {
    setTeam(SEASON_FILTER_ALL);
    setVenue(SEASON_FILTER_ALL);
    setDate(SEASON_FILTER_ALL);
    setStatus(SEASON_FILTER_ALL);
  };

  return {
    team,
    setTeam,
    venue,
    setVenue,
    date,
    setDate,
    status,
    setStatus,
    options,
    filteredRows,
    hasActiveFilters,
    clearFilters,
  };
}
