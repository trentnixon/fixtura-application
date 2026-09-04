import {
  isTemplateUseBackgroundRead,
  isTemplateUseBackgroundWrite,
  TEMPLATE_USE_BACKGROUND_READ_VALUES,
  TEMPLATE_USE_BACKGROUND_WRITE_VALUES,
  type TemplateUseBackground,
  type TemplateUseBackgroundRead,
} from "@/types/api/template-options";

export {
  TEMPLATE_USE_BACKGROUND_WRITE_VALUES,
  TEMPLATE_USE_BACKGROUND_READ_VALUES,
  isTemplateUseBackgroundWrite,
  isTemplateUseBackgroundRead,
};
export type { TemplateUseBackground, TemplateUseBackgroundRead };

export function normalizeUseBackgroundFromApi(value: unknown): TemplateUseBackgroundRead | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && isTemplateUseBackgroundRead(value)) return value;
  if (value === true) return "Gradient";
  if (value === false) return "Solid";
  return null;
}

export function isWritableUseBackground(
  value: TemplateUseBackgroundRead | null,
): value is TemplateUseBackground {
  return value !== null && isTemplateUseBackgroundWrite(value);
}

export function formatTemplateUseBackgroundLabel(value: TemplateUseBackgroundRead | null): string {
  if (value === null) return "Unset";
  return value;
}
