import { useMutation, useQueryClient } from "@tanstack/react-query";

import { shouldInvalidateBillingAfterStartTrialFailure } from "@/app/(members)/o/[accountId]/billing/_utils/trial/billingTrialStart";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { QueryClient } from "@tanstack/react-query";

async function invalidateBillingAfterStartTrial(queryClient: QueryClient, accountId: string) {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.account.billing(accountId),
  });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.account.billingAvailableTiers(accountId),
  });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.account.billingInvoiceRequests(accountId),
  });
}

/**
 * POST `/api/accounts/{accountId}/billing/start-trial` (Next BFF → Strapi `…/billing/start-trial`, body `{}`).
 * On success and org-conflict outcomes, invalidates billing-related queries so the page matches refetched GET /billing.
 */
export function usePostAccountBillingStartTrial(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => accountApi.postAccountBillingStartTrial(accountId),
    onSuccess: async () => {
      await invalidateBillingAfterStartTrial(queryClient, accountId);
    },
    onError: async (error) => {
      if (shouldInvalidateBillingAfterStartTrialFailure(error)) {
        await invalidateBillingAfterStartTrial(queryClient, accountId);
      }
    },
  });
}
