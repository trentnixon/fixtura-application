import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { CreateFirstAccountRequestBody } from "@/types/api/account";

/**
 * A1 — create or attach first account. On success, refreshes GET /api/account/me bootstrap.
 */
export function useCreateFirstAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body?: CreateFirstAccountRequestBody) => accountApi.createFirstAccount(body ?? {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}
