import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateGradientsApi } from "../../services/template-gradients.api";

/**
 * Published template gradients for selection UIs (GET /api/template-gradients/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-gradients-ui-endpoint-handoff.md
 */
export function useTemplateGradientsUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateGradients.ui,
    queryFn: () => templateGradientsApi.getTemplateGradientsUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
