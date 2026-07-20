import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type {
  GradeOrderingGetParams,
  GradeOrderingResponse,
  ReplaceGradeOrderingRequest,
} from "@/types/api/grade-ordering";

/** Persist account-scoped grade ordering via PUT …/accounts/:accountId/grade-ordering. */
export function usePutAccountGradeOrdering(
  accountId: string,
  orgParams: GradeOrderingGetParams | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReplaceGradeOrderingRequest) =>
      accountApi.putAccountGradeOrdering(accountId, body),
    onSuccess: async (data: GradeOrderingResponse) => {
      if (orgParams) {
        queryClient.setQueryData(
          queryKeys.account.gradeOrdering(
            accountId,
            orgParams.organisationType,
            orgParams.organisationId,
          ),
          data,
        );
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.organisationContext(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.scheduler(accountId) });
    },
  });
}
