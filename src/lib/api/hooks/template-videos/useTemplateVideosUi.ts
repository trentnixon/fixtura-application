import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateVideosApi } from "../../services/template-videos.api";

/**
 * Published template video configs for selection UIs (GET /api/template-videos/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-videos-ui-endpoint-handoff.md
 */
export function useTemplateVideosUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateVideos.ui,
    queryFn: () => templateVideosApi.getTemplateVideosUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
