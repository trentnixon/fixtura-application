import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateTexturesApi } from "../../services/template-textures.api";

/**
 * Published template textures for selection UIs (GET /api/template-textures/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-textures-ui-endpoint-handoff.md
 */
export function useTemplateTexturesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateTextures.ui,
    queryFn: () => templateTexturesApi.getTemplateTexturesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
