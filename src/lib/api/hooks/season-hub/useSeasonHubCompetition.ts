import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export function useSeasonHubCompetition(
  accountId: string,
  competitionId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId && competitionId);
  return useQuery({
    queryKey: queryKeys.seasonHub.competition(accountId, competitionId),
    queryFn: () => seasonHubApi.getCompetition(accountId, competitionId),
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
