import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryKeys } from "../../query/query-keys";
import { authApi } from "../../services/auth.api";

import type { LoginRequest } from "@/types/api/auth";

/**
 * Hook for user login mutation.
 * Handles cache invalidation and potential redirects.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: async () => {
      // Invalidate current user when logged in
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      // Clear all other caches just in case
      queryClient.clear();
      // Ensure the router is refreshed to pick up new session
      router.refresh();
    },
  });
}
