import type { SeasonOverviewCompetitionRow } from "../_types";
import type { ApiError } from "@/lib/api/client/api-error";

export function seasonHubCodeFromApiError(error: ApiError): string | undefined {
  const details = error.details;
  if (typeof details !== "object" || details === null) {
    return undefined;
  }

  const err = (details as { error?: { code?: unknown } }).error;
  if (typeof err === "object" && err !== null && typeof err.code === "string") {
    return err.code;
  }

  return undefined;
}

export function isSeasonStatusActive(status: string | null | undefined): boolean {
  return /\bactive\b/i.test(String(status ?? ""));
}

export function sortSeasonOverviewCompetitionRows(
  rows: SeasonOverviewCompetitionRow[],
): SeasonOverviewCompetitionRow[] {
  return [...rows].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }),
  );
}

function sortLocale(x: string, y: string) {
  return x.localeCompare(y, undefined, { sensitivity: "base" });
}

export function buildSeasonOverviewFilterOptions(rows: SeasonOverviewCompetitionRow[]) {
  const statusSet = new Set<string>();
  const seasonSet = new Set<string>();
  const associationSet = new Set<string>();

  for (const competition of rows) {
    statusSet.add(competition.status ?? "Unknown");
    seasonSet.add(competition.season ?? "No season");
    associationSet.add(competition.association.name ?? "Association");
  }

  return {
    statusOptions: [...statusSet].sort(sortLocale),
    seasonOptions: [...seasonSet].sort(sortLocale),
    associationOptions: [...associationSet].sort(sortLocale),
  };
}

export type SeasonOverviewFilterValues = {
  searchQuery: string;
  statusFilter: string;
  seasonFilter: string;
  associationFilter: string;
  filterAllValue: string;
};

export function filterSeasonOverviewCompetitionRows(
  rows: SeasonOverviewCompetitionRow[],
  filters: SeasonOverviewFilterValues,
): SeasonOverviewCompetitionRow[] {
  const normalizedSearch = filters.searchQuery.trim().toLocaleLowerCase();

  return rows.filter((competition) => {
    const statusLabel = competition.status ?? "Unknown";
    const seasonLabel = competition.season ?? "No season";
    const associationLabel = competition.association.name ?? "Association";
    const searchable = [competition.name ?? "", seasonLabel, associationLabel, statusLabel]
      .join(" ")
      .toLocaleLowerCase();

    const matchesSearch = normalizedSearch.length === 0 || searchable.includes(normalizedSearch);
    const matchesStatus =
      filters.statusFilter === filters.filterAllValue || statusLabel === filters.statusFilter;
    const matchesSeason =
      filters.seasonFilter === filters.filterAllValue || seasonLabel === filters.seasonFilter;
    const matchesAssociation =
      filters.associationFilter === filters.filterAllValue ||
      associationLabel === filters.associationFilter;

    return matchesSearch && matchesStatus && matchesSeason && matchesAssociation;
  });
}
