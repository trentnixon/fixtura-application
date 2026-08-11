import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Withdraw invoice request (POST …/billing/invoice-requests/:invoiceRequestId/cancel).
 * Refetches billing summary, invoice-requests list, and orders (linked manual-invoice order may change).
 */
export function usePostAccountBillingCancelInvoiceRequest(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceRequestId: string) =>
      accountApi.postAccountBillingCancelInvoiceRequest(accountId, invoiceRequestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingInvoiceRequests(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    },
  });
}
