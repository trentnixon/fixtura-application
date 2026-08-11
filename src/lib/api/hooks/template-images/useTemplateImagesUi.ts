import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { templateImagesApi } from "../../services/template-images.api";

/**
 * Published template images for selection UIs (GET /api/template-images/ui).
 *
 * @see src/app/sandbox/data-lab/.doc/requests/template-images-ui-frontend-handoff.md
 */
export function useTemplateImagesUi(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.templateImages.ui,
    queryFn: () => templateImagesApi.getTemplateImagesUi(),
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
