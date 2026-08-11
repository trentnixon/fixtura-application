import type { TemplateGradientUiItem } from "@/types/api/template-gradients";

export function gradientLabel(g: TemplateGradientUiItem): string {
  return g.name?.trim() || `Gradient ${g.id}`;
}
