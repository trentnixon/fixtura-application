import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountBillingCheckoutRequest } from "@/types/api/account";

/**
 * Start Stripe Checkout for the scoped account (POST …/billing/checkout).
 * On success, invalidates billing summary (refresh after redirect per handoff).
 */
export function usePostAccountBillingCheckout(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PostAccountBillingCheckoutRequest) =>
      accountApi.postAccountBillingCheckout(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
    },
  });
}
