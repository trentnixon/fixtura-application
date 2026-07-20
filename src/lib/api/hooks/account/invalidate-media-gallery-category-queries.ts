import { queryKeys } from "../../query/query-keys";

import type { QueryClient } from "@tanstack/react-query";

/**
 * Refresh TanStack reads used by Media Gallery category config after settings
 * that affect grouping mode (group_assets_by, split_seniors_and_masters).
 */
export async function invalidateMediaGalleryCategoryQueries(
  queryClient: QueryClient,
  accountId: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
  await queryClient.invalidateQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.account.organisationContext(accountId),
  });
  await queryClient.invalidateQueries({ queryKey: queryKeys.seasonHub.all });
  await queryClient.invalidateQueries({
    queryKey: ["account", "grade-ordering", accountId],
  });
}
