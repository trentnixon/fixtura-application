import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { accountApi } from "@/lib/api/services/account.api";
import { ROUTES } from "@/lib/config/routes";

import { queryKeys } from "../../query/query-keys";

/** Avoid refetch while wizard may still observe this accountId (account no longer exists). */
const NO_REFETCH = { refetchType: "none" as const };

/**
 * Epic 6 — DELETE unfinished account when CMS allows; redirects to organisation selection on success.
 */
export function useDeleteUnfinishedAccount(accountId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => accountApi.deleteUnfinishedAccount(accountId),
    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
        ...NO_REFETCH,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.setupStatus(accountId),
        ...NO_REFETCH,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.settings(accountId),
        ...NO_REFETCH,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.organisationContext(accountId),
        ...NO_REFETCH,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.branding(accountId),
        ...NO_REFETCH,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      router.replace(ROUTES.selectOrganisation);
    },
  });
}
