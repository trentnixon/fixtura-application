export const SEASON_LOADING_COPY = {
  season: "Loading season…",
  competition: "Loading competition…",
  grades: "Loading grades…",
  grade: "Loading grade…",
  fixtures: "Loading fixtures…",
  fixture: "Loading fixture…",
  access: "Checking access",
} as const;

export const SEASON_ONBOARDING_COPY = {
  title: "Season is almost ready",
  description:
    "We are still preparing your organisation. Season access will unlock once setup is finished.",
} as const;

export const SEASON_FILTER_ALL = "all" as const;

/** Select value for fixtures with no status (grade view filters). */
export const SEASON_GRADE_FIXTURE_STATUS_EMPTY = "__status_empty__" as const;

export const SEASON_OVERVIEW_COVERAGE_OPTIONS = [
  { value: "all", label: "All coverage" },
  { value: "has-grades", label: "Has grades" },
  { value: "no-grades", label: "No grades" },
  { value: "has-fixtures", label: "Has fixtures" },
  { value: "no-fixtures", label: "No fixtures" },
] as const;
