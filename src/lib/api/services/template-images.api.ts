import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateImagesUiResponse } from "@/types/api/template-images";

export const templateImagesApi = {
  getTemplateImagesUi: () =>
    apiClient.get<TemplateImagesUiResponse>(appRoutes.templateImages.ui.path),
};
