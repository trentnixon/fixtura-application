import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { resetAnalytics } from "@/lib/analytics";
import { getLogoutRedirectPath } from "@/lib/config/logout-redirect";

import { authApi } from "../../services/auth.api";

/**
 * Hook for user logout mutation.
 * Handles cache clearing and redirect.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      resetAnalytics();
      // Clear all TanStack Query caches
      queryClient.clear();
      // Redirect to the configured logout destination (login page)
      router.push(getLogoutRedirectPath());
      // Refresh to pick up cleared session cookies
      router.refresh();
    },
  });
}
