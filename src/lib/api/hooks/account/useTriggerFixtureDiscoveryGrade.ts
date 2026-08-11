import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { queryKeys } from "../../query/query-keys";

import type { TriggerFixtureDiscoveryGradeRequest } from "@/types/api/account";

/**
 * Queue fixture discovery for one grade and refresh season-hub grade + fixtures reads.
 */
export function useTriggerFixtureDiscoveryGrade(
  accountId: string,
  competitionId: string,
  gradeId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerFixtureDiscoveryGradeRequest) =>
      accountApi.triggerFixtureDiscoveryGrade(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.grade(accountId, gradeId, competitionId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.gradeFixtures(accountId, gradeId, competitionId),
      });
    },
  });
}
