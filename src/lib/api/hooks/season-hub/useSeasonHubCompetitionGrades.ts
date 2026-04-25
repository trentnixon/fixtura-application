import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export function useSeasonHubCompetitionGrades(
  accountId: string,
  competitionId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId && competitionId);
  return useQuery({
    queryKey: queryKeys.seasonHub.competitionGrades(accountId, competitionId),
    queryFn: () => seasonHubApi.getCompetitionGrades(accountId, competitionId),
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
