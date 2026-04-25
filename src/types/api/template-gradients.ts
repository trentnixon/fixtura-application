/** GET /api/template-gradients/ui (Next.js BFF -> Strapi). */
export interface TemplateGradientsUiResponse {
  data: TemplateGradientUiItem[];
}

export interface TemplateGradientUiItem {
  id: number;
  name: string | null;
  ui: TemplateGradientUiConfig | null;
}

export interface TemplateGradientUiConfig {
  type: string | null;
  direction: string | null;
}
