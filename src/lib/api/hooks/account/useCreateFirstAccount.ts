import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { CreateFirstAccountRequestBody } from "@/types/api/account";

/**
 * Obtain the user's reusable blank organisation account (200 reuse / 201 create).
 * On success, refreshes GET /api/account/me bootstrap. Busy (`503 ACCOUNT_CREATE_BUSY`)
 * surfaces via `ApiError` with `details` + `retryAfterSeconds` for Phase 04 UI.
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
