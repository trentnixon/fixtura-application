import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Discard pending Stripe checkout order via POST …/billing/orders/:orderId/delete (CMS: not for invoice-channel).
 * Refreshes billing summary and orders after success (including idempotent noOp).
 */
export function usePostAccountBillingDeletePendingOrder(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      accountApi.postAccountBillingDeletePendingOrder(accountId, orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    },
  });
}
