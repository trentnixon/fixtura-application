import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templatePalettesApi } from "../../services/template-palettes.api";

/**
 * Published template palettes for selection UIs (GET /api/template-palettes/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-palettes-ui-endpoint-handoff.md
 */
export function useTemplatePalettesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templatePalettes.ui,
    queryFn: () => templatePalettesApi.getTemplatePalettesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
