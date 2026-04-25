import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export function useSeasonHubGradeFixtures(
  accountId: string,
  gradeId: string,
  options?: { competitionId?: string; enabled?: boolean },
) {
  const competitionId = options?.competitionId;
  const useCanonical = typeof competitionId === "string" && competitionId.length > 0;
  const enabled = options?.enabled ?? Boolean(accountId && gradeId);
  return useQuery({
    queryKey: queryKeys.seasonHub.gradeFixtures(
      accountId,
      gradeId,
      useCanonical ? competitionId : null,
    ),
    queryFn: () =>
      useCanonical
        ? seasonHubApi.getGradeFixturesInCompetition(accountId, competitionId, gradeId)
        : seasonHubApi.getGradeFixturesAlias(accountId, gradeId),
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
