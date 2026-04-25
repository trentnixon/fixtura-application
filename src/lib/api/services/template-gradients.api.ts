import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateGradientsUiResponse } from "@/types/api/template-gradients";

export const templateGradientsApi = {
  getTemplateGradientsUi: () =>
    apiClient.get<TemplateGradientsUiResponse>(appRoutes.templateGradients.ui.path),
};
