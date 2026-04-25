import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateNoisesUiResponse } from "@/types/api/template-noises";

export const templateNoisesApi = {
  getTemplateNoisesUi: () =>
    apiClient.get<TemplateNoisesUiResponse>(appRoutes.templateNoises.ui.path),
};
