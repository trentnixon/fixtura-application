import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/**
 * Live template categories for dropdowns (GET /api/account/template-categories/list-for-selection).
 * Includes private categories; filter in UI when needed. staleTime 0 matches useAllTemplateOptions.
 *
 * @see .comms/data-fetching/handoff/handoff-list-for-selection.md
 */
export function useTemplateCategoriesListForSelection(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.account.templateCategoriesListForSelection,
    queryFn: () => accountApi.getTemplateCategoriesListForSelection(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
