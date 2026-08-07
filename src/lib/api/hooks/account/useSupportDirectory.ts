import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { SupportDirectoryParams } from "@/types/api/account";

export type UseSupportDirectoryOptions = {
  enabled?: boolean;
};

/**
 * Support super-user account directory (GET /api/account/support/directory).
 * No cache — honours upstream Cache-Control: private, no-store.
 */
export function useSupportDirectory(
  params?: SupportDirectoryParams,
  options?: UseSupportDirectoryOptions,
) {
  return useQuery({
    queryKey: queryKeys.account.supportDirectory(params),
    queryFn: () => accountApi.getSupportDirectory(params),
    staleTime: 0,
    gcTime: 0,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 403 || error.status === 429)) {
        return false;
      }
      return failureCount < 1;
    },
    enabled: options?.enabled !== false,
  });
}
