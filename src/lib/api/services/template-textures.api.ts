import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { GetTemplateTexturesForUiResponse } from "@/types/api/template-textures";

export const templateTexturesApi = {
  getTemplateTexturesUi: () =>
    apiClient.get<GetTemplateTexturesForUiResponse>(appRoutes.templateTextures.ui.path),
};
