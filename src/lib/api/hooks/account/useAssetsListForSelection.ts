import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Published assets for selection UIs (GET /api/assets/list-for-selection).
 *
 * @see .comms/API/ASSETS-handoff-list-for-selection.md
 */
export function useAssetsListForSelection(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.assets.listForSelection,
    queryFn: () => accountApi.getAssetsListForSelection(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
