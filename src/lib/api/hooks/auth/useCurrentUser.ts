import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { authApi } from "../../services/auth.api";

/**
 * Hook to fetch and cache the current authenticated user's details.
 * Owned by TanStack Query.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider current user data fresh for 5 mins
    retry: 1, // Only retry once for user fetch
  });
}
