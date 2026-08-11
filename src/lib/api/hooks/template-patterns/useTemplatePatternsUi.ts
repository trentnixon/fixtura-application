import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templatePatternsApi } from "../../services/template-patterns.api";

/**
 * Published template patterns for selection UIs (GET /api/template-patterns/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-patterns-ui-endpoint-handoff.md
 */
export function useTemplatePatternsUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templatePatterns.ui,
    queryFn: () => templatePatternsApi.getTemplatePatternsUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
