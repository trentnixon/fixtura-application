import type { TemplateNoiseUiItem } from "@/types/api/template-noises";

export function templateNoiseLabel(noise: TemplateNoiseUiItem): string {
  return noise.name?.trim() || `Template noise ${noise.id}`;
}
