import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplateParticlesUiResponse } from "@/types/api/template-particles";

export const templateParticlesApi = {
  getTemplateParticlesUi: () =>
    apiClient.get<TemplateParticlesUiResponse>(appRoutes.templateParticles.ui.path),
};
