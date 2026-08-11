type SeasonOverviewCounts = {
  competitions: number;
  grades: number;
  teams: number;
  fixtures: number;
};

type SeasonOverviewAvailability = {
  competitions: boolean;
};

type SeasonOverviewRecon = {
  counts: SeasonOverviewCounts;
  available: SeasonOverviewAvailability;
};

type UseSeasonOverviewStateArgs = {
  reconData: SeasonOverviewRecon | undefined;
  competitionListLength: number;
  competitionsPending: boolean;
};

export function useSeasonOverviewState({
  reconData,
  competitionListLength,
  competitionsPending,
}: UseSeasonOverviewStateArgs) {
  const counts = reconData?.counts;
  const allResourceZeros =
    counts !== undefined &&
    counts.competitions === 0 &&
    counts.grades === 0 &&
    counts.teams === 0 &&
    counts.fixtures === 0;

  const competitionsUnavailable = reconData !== undefined && !reconData.available.competitions;
  const listEmptyButScopeShowsCompetitions =
    Boolean(counts && counts.competitions > 0) &&
    competitionListLength === 0 &&
    !competitionsPending;

  return {
    allResourceZeros,
    competitionsUnavailable,
    listEmptyButScopeShowsCompetitions,
  };
}
