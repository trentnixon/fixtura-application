import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountBillingInvoiceRequestBody } from "@/types/api/account";

/**
 * Submit an invoice payment request (POST …/billing/invoice-requests).
 * On success, invalidates billing summary and invoice request list.
 */
export function usePostAccountBillingInvoiceRequest(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PostAccountBillingInvoiceRequestBody) =>
      accountApi.postAccountBillingInvoiceRequest(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billing(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.billingInvoiceRequests(accountId),
      });
    },
  });
}
