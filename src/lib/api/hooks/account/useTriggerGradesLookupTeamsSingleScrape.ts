import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { withScopedAccountIdBody } from "./with-scoped-account-id-body";
import { queryKeys } from "../../query/query-keys";

import type { TriggerGradesLookupTeamsSingleScrapeRequest } from "@/types/api/account";

/**
 * Queue teams lookup for all grades under one competition and refresh season-hub reads for this grade.
 */
export function useTriggerGradesLookupTeamsSingleScrape(
  accountId: string,
  competitionId: string,
  gradeId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerGradesLookupTeamsSingleScrapeRequest) =>
      accountApi.triggerGradesLookupTeamsSingleScrape(withScopedAccountIdBody(accountId, body)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competition(accountId, competitionId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competitionGrades(accountId, competitionId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.grade(accountId, gradeId, competitionId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.gradeFixtures(accountId, gradeId, competitionId),
      });
    },
  });
}
