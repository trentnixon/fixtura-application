import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Hook to fetch and cache the current authenticated account's details
 * and dashboard content hub data.
 */
export function useAccountMe(depth?: "extended") {
  return useQuery({
    queryKey: [...queryKeys.account.me, depth].filter(Boolean),
    queryFn: () => accountApi.getAccountMe(depth),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
