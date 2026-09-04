import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { withScopedAccountIdBody } from "./with-scoped-account-id-body";
import { queryKeys } from "../../query/query-keys";

import type { TriggerAssociationSingleScrapeRequest } from "@/types/api/account";

/**
 * Trigger a single association scrape and refresh season-hub reads.
 */
export function useTriggerAssociationSingleScrape(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TriggerAssociationSingleScrapeRequest) =>
      accountApi.triggerAssociationSingleScrape(withScopedAccountIdBody(accountId, body)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasonHub.recon(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasonHub.stats(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.seasonHub.competitions(accountId, { page: 1, pageSize: 25 }),
      });
    },
  });
}
