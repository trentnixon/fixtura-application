import type { TemplateModeUiItem } from "@/types/api/template-modes";

export function templateModeSlugMissing(mode: TemplateModeUiItem): boolean {
  return !mode.slug?.trim();
}
