import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountBrandingBody } from "@/types/api/account";

/**
 * Persist organisation branding (palette + template mode) via PATCH …/accounts/:accountId/branding.
 */
export function usePatchAccountBranding(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountBrandingBody) =>
      accountApi.patchAccountBranding(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.branding(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
    },
  });
}
