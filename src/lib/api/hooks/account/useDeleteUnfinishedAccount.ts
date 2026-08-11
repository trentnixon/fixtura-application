import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client/api-error";
import {
  clearDeletedAccountPersistedState,
  removeExactAccountScopedQueries,
} from "@/lib/api/query/is-exact-account-scoped-query-key";
import { accountApi } from "@/lib/api/services/account.api";
import { ROUTES } from "@/lib/config/routes";

import {
  accountIdPresentInMePayload,
  DELETE_CONFIRMATION_FAILED_MESSAGE,
  isDefiniteDeleteFailure,
  isUncertainDeleteOutcome,
} from "../../account-delete-outcome";
import { queryKeys } from "../../query/query-keys";

/**
 * DELETE unfinished account when CMS allows; redirects to organisation selection on confirmed success.
 * Uncertain outcomes (timeout / 5xx / transport) are reconciled against a fresh `/api/account/me`.
 */
export function useDeleteUnfinishedAccount(accountId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        return await accountApi.deleteUnfinishedAccount(accountId);
      } catch (error) {
        if (isDefiniteDeleteFailure(error) || !isUncertainDeleteOutcome(error)) {
          throw error;
        }

        let mePayload;
        try {
          const meResponse = await queryClient.fetchQuery({
            queryKey: queryKeys.account.me,
            queryFn: () => accountApi.getAccountMe(),
          });
          mePayload = meResponse.data;
        } catch {
          throw new ApiError({
            status: 500,
            message: DELETE_CONFIRMATION_FAILED_MESSAGE,
          });
        }

        if (!accountIdPresentInMePayload(mePayload, accountId)) {
          return {
            data: { accountId: Number(accountId), deleted: true as const },
            reconciledFromMe: true as const,
          };
        }

        throw error;
      }
    },
    onSuccess: async () => {
      await removeExactAccountScopedQueries(queryClient, accountId);
      clearDeletedAccountPersistedState(accountId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.replace(ROUTES.selectOrganisation);
    },
  });
}
