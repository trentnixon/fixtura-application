import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../../client/fetch-client";
import { queryKeys } from "../../query/query-keys";
import { appRoutes } from "../../routes/route-definitions";

export interface SessionState {
  authenticated: boolean;
}

/**
 * Hook to check the current session status (authenticated or not).
 * Used for high-level session boundaries and UX feedback.
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => apiClient.get<SessionState>(appRoutes.auth.session.path),
    staleTime: 60_000,
    retry: 1,
  });
}
