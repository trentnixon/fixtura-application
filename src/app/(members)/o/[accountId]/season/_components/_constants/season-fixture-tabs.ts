export const SEASON_FIXTURE_DETAIL_TAB_VALUES = ["match", "scorecard", "teams", "outputs"] as const;

export type SeasonFixtureDetailTabValue = (typeof SEASON_FIXTURE_DETAIL_TAB_VALUES)[number];

export const SEASON_FIXTURE_DETAIL_TABS_ARIA_LABEL = "Fixture detail views";

export const SEASON_FIXTURE_DETAIL_TAB_LABELS: Record<SeasonFixtureDetailTabValue, string> = {
  match: "Match",
  scorecard: "Scorecard",
  teams: "Teams",
  outputs: "Outputs",
};

export const SEASON_FIXTURE_DETAIL_OUTPUTS_EMPTY_COPY =
  "No render, download, or metadata details for this fixture.";
