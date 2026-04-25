import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { GetTemplateVideosForUiResponse } from "@/types/api/template-videos";

export const templateVideosApi = {
  getTemplateVideosUi: () =>
    apiClient.get<GetTemplateVideosForUiResponse>(appRoutes.templateVideos.ui.path),
};
