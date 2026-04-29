import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { queryKeys } from "../../query/query-keys";

import type { TriggerClubSingleScrapeRequest } from "@/types/api/account";

/**
 * Trigger a single club scrape and refresh season-hub reads.
 */
export function useTriggerClubSingleScrape(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerClubSingleScrapeRequest) => accountApi.triggerClubSingleScrape(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasonHub.recon(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasonHub.stats(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competitions(accountId, { page: 1, pageSize: 25 }),
      });
    },
  });
}
