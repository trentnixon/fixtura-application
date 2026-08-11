import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

export type UseAccountMeOptions = {
  /** When false, the query does not run (e.g. dev UI simulation). Default true. */
  enabled?: boolean;
};

/**
 * Hook to fetch and cache GET /account/me bootstrap (user, accountId, light accounts[]).
 */
export function useAccountMe(options?: UseAccountMeOptions) {
  return useQuery({
    queryKey: queryKeys.account.me,
    queryFn: () => accountApi.getAccountMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: options?.enabled !== false,
  });
}
