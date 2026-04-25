import type { TemplateNoiseUiItem } from "@/types/api/template-noises";

export function templateNoiseTypeMissing(noise: TemplateNoiseUiItem): boolean {
  return noise.ui?.type == null || !String(noise.ui.type).trim();
}
