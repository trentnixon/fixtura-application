import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Full dashboard aggregate for the scoped account (GET /api/account/organisation/[accountId]).
 */
export function useAccountOrganisation(accountId: string) {
  return useQuery({
    queryKey: queryKeys.account.organisation(accountId),
    queryFn: () => accountApi.getOrganisationAccountDetails(accountId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: Boolean(accountId),
  });
}
