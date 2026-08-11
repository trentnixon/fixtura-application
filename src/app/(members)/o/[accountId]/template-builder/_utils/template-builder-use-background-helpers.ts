import {
  isTemplateUseBackground,
  TEMPLATE_USE_BACKGROUND_VALUES,
  type TemplateUseBackground,
} from "@/types/api/template-options";

export { TEMPLATE_USE_BACKGROUND_VALUES, isTemplateUseBackground };
export type { TemplateUseBackground };

export function normalizeUseBackgroundFromApi(value: unknown): TemplateUseBackground | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && isTemplateUseBackground(value)) return value;
  if (value === true) return "Gradient";
  if (value === false) return "Solid";
  return null;
}

export function formatTemplateUseBackgroundLabel(value: TemplateUseBackground | null): string {
  if (value === null) return "Unset";
  return value;
}
