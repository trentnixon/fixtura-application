import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

import type { SeasonHubCompetitionsListParams } from "@/types/api/season-hub";

export function useSeasonHubCompetitions(
  accountId: string,
  params?: SeasonHubCompetitionsListParams,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.seasonHub.competitions(accountId, params),
    queryFn: () => seasonHubApi.getCompetitions(accountId, params),
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
