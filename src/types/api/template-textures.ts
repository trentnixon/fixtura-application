export type TemplateTextureBlendMode = "multiply";

export type TemplateTextureCategory =
  "Paper" | "Print" | "Turf" | "Infrastructure" | "Metal" | "Stadium";

export type TextureMedia = {
  id: number;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
};

export type TemplateTextureUiItem = {
  id: number;
  name: string | null;
  category: TemplateTextureCategory | null;
  opacity: string | number | null;
  blendMode: TemplateTextureBlendMode | null;
  texture: TextureMedia | null;
};

export type GetTemplateTexturesForUiResponse = {
  data: TemplateTextureUiItem[];
};

export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
