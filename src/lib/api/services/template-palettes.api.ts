import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { TemplatePalettesUiResponse } from "@/types/api/template-palettes";

export const templatePalettesApi = {
  getTemplatePalettesUi: () =>
    apiClient.get<TemplatePalettesUiResponse>(appRoutes.templatePalettes.ui.path),
};
