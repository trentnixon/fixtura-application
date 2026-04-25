import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateParticlesApi } from "../../services/template-particles.api";

/**
 * Published template particles for selection UIs (GET /api/template-particles/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-particles-ui-endpoint-handoff.md
 */
export function useTemplateParticlesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateParticles.ui,
    queryFn: () => templateParticlesApi.getTemplateParticlesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
