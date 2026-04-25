/** GET /api/template-modes/ui (Next.js BFF -> Strapi). */
export type TemplateModeUiItem = {
  id: number;
  name: string | null;
  slug: string | null;
};

export type TemplateModesUiResponse = {
  data: TemplateModeUiItem[];
};
