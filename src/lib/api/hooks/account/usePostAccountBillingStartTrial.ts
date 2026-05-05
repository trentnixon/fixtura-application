import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * POST `/api/accounts/{accountId}/billing/start-trial` (Next BFF → Strapi `…/billing/start-trial`, body `{}`).
 * On success, invalidates billing-related queries so the page matches refetched GET /billing.
 */
export function usePostAccountBillingStartTrial(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => accountApi.postAccountBillingStartTrial(accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billing(accountId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingAvailableTiers(accountId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingInvoiceRequests(accountId),
      });
    },
  });
}
