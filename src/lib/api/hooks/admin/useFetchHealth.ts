import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { healthApi } from "../../services/health.api";

/**
 * Hook to fetch the API health status.
 * Used exclusively by the admin diagnostics page.
 */
export function useFetchHealth() {
  return useQuery({
    queryKey: queryKeys.admin.fetchHealth,
    queryFn: healthApi.getFetchHealth,
    // Typically diagnostics are manual or infrequent, don't refetch on focus
    refetchOnWindowFocus: false,
    retry: 0, // Don't retry if a health check fails, just report it
  });
}
