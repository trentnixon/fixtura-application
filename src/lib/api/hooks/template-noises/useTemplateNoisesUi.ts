import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateNoisesApi } from "../../services/template-noises.api";

/**
 * Published template noises for selection UIs (GET /api/template-noises/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-noises-ui-endpoint-handoff.md
 */
export function useTemplateNoisesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateNoises.ui,
    queryFn: () => templateNoisesApi.getTemplateNoisesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
