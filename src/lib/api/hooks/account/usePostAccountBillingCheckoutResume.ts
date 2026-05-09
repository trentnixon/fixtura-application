import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountBillingCheckoutResumeRequest } from "@/types/api/account";

/**
 * Resume Stripe Checkout for a pending order (POST …/billing/checkout/resume).
 * Refreshes billing summary and orders after success (especially after Option B new orderId).
 */
export function usePostAccountBillingCheckoutResume(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PostAccountBillingCheckoutResumeRequest) =>
      accountApi.postAccountBillingCheckoutResume(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    },
  });
}
