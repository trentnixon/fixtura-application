import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { GetTemplatePatternsUiResponse } from "@/types/api/template-patterns";

export const templatePatternsApi = {
  getTemplatePatternsUi: () =>
    apiClient.get<GetTemplatePatternsUiResponse>(appRoutes.templatePatterns.ui.path),
};
