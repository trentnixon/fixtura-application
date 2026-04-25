import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export type SeasonHubFixtureQueryArgs =
  | {
      accountId: string;
      gradeId: string;
      fixtureId: string;
      competitionId: string;
    }
  | {
      accountId: string;
      gradeId: string;
      fixtureId: string;
      competitionId?: undefined;
    };

export function useSeasonHubFixture(
  args: SeasonHubFixtureQueryArgs,
  options?: { enabled?: boolean },
) {
  const { accountId, gradeId, fixtureId, competitionId } = args;
  const isCanonical = typeof competitionId === "string" && competitionId.length > 0;
  const baseEnabled =
    Boolean(accountId && gradeId && fixtureId) && (isCanonical ? Boolean(competitionId) : true);
  const enabled = options?.enabled ?? baseEnabled;

  return useQuery({
    queryKey: isCanonical
      ? queryKeys.seasonHub.fixture(accountId, competitionId!, gradeId, fixtureId)
      : queryKeys.seasonHub.fixtureAlias(accountId, gradeId, fixtureId),
    queryFn: () =>
      isCanonical
        ? seasonHubApi.getFixtureCanonical(accountId, competitionId!, gradeId, fixtureId)
        : seasonHubApi.getFixtureAlias(accountId, gradeId, fixtureId),
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
