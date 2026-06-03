import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { queryKeys } from "../../query/query-keys";

import type { TriggerResultSingleScrapeRequest } from "@/types/api/account";

/**
 * Queue a single fixture result scrape and refresh season-hub fixture + grade fixtures reads.
 */
export function useTriggerResultSingleScrape(
  accountId: string,
  competitionId: string,
  gradeId: string,
  fixtureId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerResultSingleScrapeRequest) =>
      accountApi.triggerResultSingleScrape(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.fixture(accountId, competitionId, gradeId, fixtureId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.gradeFixtures(accountId, gradeId, competitionId),
      });
    },
  });
}
