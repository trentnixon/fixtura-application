import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { withScopedAccountIdBody } from "./with-scoped-account-id-body";
import { queryKeys } from "../../query/query-keys";

import type { TriggerGradesCompsSingleScrapeRequest } from "@/types/api/account";

/**
 * Queue a single competition grades scrape and refresh season-hub competition reads.
 */
export function useTriggerGradesCompsSingleScrape(accountId: string, competitionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerGradesCompsSingleScrapeRequest) =>
      accountApi.triggerGradesCompsSingleScrape(withScopedAccountIdBody(accountId, body)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competition(accountId, competitionId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competitionGrades(accountId, competitionId),
      });
    },
  });
}
