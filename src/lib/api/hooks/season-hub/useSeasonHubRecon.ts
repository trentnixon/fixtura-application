import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export function useSeasonHubRecon(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.seasonHub.recon(accountId),
    queryFn: () => seasonHubApi.getRecon(accountId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
