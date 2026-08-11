"use client";

import { useMemo, useState } from "react";

import { SEASON_FILTER_ALL } from "../_constants";
import {
  buildSeasonOverviewFilterOptions,
  filterSeasonOverviewCompetitionRows,
  sortSeasonOverviewCompetitionRows,
} from "../_utils";

import type { SeasonOverviewCompetitionRow } from "../_types";

type UseSeasonOverviewFiltersArgs = {
  rows: SeasonOverviewCompetitionRow[];
};

export function useSeasonOverviewFilters({ rows }: UseSeasonOverviewFiltersArgs) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(SEASON_FILTER_ALL);
  const [seasonFilter, setSeasonFilter] = useState<string>(SEASON_FILTER_ALL);
  const [associationFilter, setAssociationFilter] = useState<string>(SEASON_FILTER_ALL);

  const sortedCompetitionRows = useMemo(() => sortSeasonOverviewCompetitionRows(rows), [rows]);

  const { statusOptions, seasonOptions, associationOptions } = useMemo(
    () => buildSeasonOverviewFilterOptions(sortedCompetitionRows),
    [sortedCompetitionRows],
  );

  const filteredCompetitionRows = useMemo(
    () =>
      filterSeasonOverviewCompetitionRows(sortedCompetitionRows, {
        searchQuery,
        statusFilter,
        seasonFilter,
        associationFilter,
        filterAllValue: SEASON_FILTER_ALL,
      }),
    [associationFilter, searchQuery, seasonFilter, sortedCompetitionRows, statusFilter],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== SEASON_FILTER_ALL ||
    seasonFilter !== SEASON_FILTER_ALL ||
    associationFilter !== SEASON_FILTER_ALL;

  const setStatusFilterValue = (value: string) => {
    setStatusFilter(value);
  };
  const setSeasonFilterValue = (value: string) => {
    setSeasonFilter(value);
  };
  const setAssociationFilterValue = (value: string) => {
    setAssociationFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(SEASON_FILTER_ALL);
    setSeasonFilter(SEASON_FILTER_ALL);
    setAssociationFilter(SEASON_FILTER_ALL);
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: setStatusFilterValue,
    seasonFilter,
    setSeasonFilter: setSeasonFilterValue,
    associationFilter,
    setAssociationFilter: setAssociationFilterValue,
    sortedCompetitionRows,
    filteredCompetitionRows,
    statusOptions,
    seasonOptions,
    associationOptions,
    hasActiveFilters,
    clearFilters,
  };
}
