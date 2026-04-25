/** GET /api/template-patterns/ui (Next.js BFF -> Strapi). */
export type PatternType = "Triangles" | "lines" | "grid" | "dots" | "Crosshatch" | "Chevron";

export type PatternAnimation =
  | "none"
  | "panDown"
  | "panUp"
  | "panRight"
  | "panLeft"
  | "rotate"
  | "pulse";

export type TemplatePatternUi = {
  type: PatternType | null;
  animation: PatternAnimation | null;
  scale: number | null;
  rotation: number | null;
  opacity: number | null;
  animationDuration: number | null;
  animationSpeed: number | null;
};

export type TemplatePatternUiItem = {
  id: number;
  name: string | null;
  ui: TemplatePatternUi;
};

export type GetTemplatePatternsUiResponse = {
  data: TemplatePatternUiItem[];
};
