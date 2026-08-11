export const SEASON_LOADING_COPY = {
  season: "Loading Vision…",
  competition: "Loading competition…",
  grades: "Loading grades…",
  grade: "Loading grade…",
  fixtures: "Loading fixtures…",
  fixture: "Loading fixture…",
  access: "Checking access",
} as const;

export const SEASON_ONBOARDING_COPY = {
  title: "Vision is almost ready",
  description:
    "We are still preparing your organisation. Vision will unlock once setup is finished.",
} as const;

export const SEASON_FILTER_ALL = "all" as const;

/** Select value for fixtures with no status (grade view filters). */
export const SEASON_GRADE_FIXTURE_STATUS_EMPTY = "__status_empty__" as const;
