import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountBillingInvoiceRequestBody } from "@/types/api/account";

/**
 * Submit an invoice request: browser POSTs to the Next.js BFF
 * `/api/accounts/:accountId/billing/invoice-requests` (session cookie), which forwards to Strapi
 * `POST {STRAPI_URL}/api/accounts/:accountId/billing/invoice-requests` with `Authorization: Bearer`.
 * On success, invalidates billing summary, invoice request list, and order history — refetch GET
 * billing for `billingStatus`, `latestInvoiceRequest`, and `availableActions`, plus GET orders so
 * `deriveBillingUiMode` sees pending checkout rows after redirect (not stale cache).
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.billingOrders(accountId) });
    },
  });
}
