import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateModesUiResponse } from "@/types/api/template-modes";

export const templateModesApi = {
  getTemplateModesUi: () => apiClient.get<TemplateModesUiResponse>(appRoutes.templateModes.ui.path),
};
