import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateModesApi } from "../../services/template-modes.api";

/**
 * Published template modes for selection UIs (GET /api/template-modes/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-modes-ui-endpoint-handoff.md
 */
export function useTemplateModesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateModes.ui,
    queryFn: () => templateModesApi.getTemplateModesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
