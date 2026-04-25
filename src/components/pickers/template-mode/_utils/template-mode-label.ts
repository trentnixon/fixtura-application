import type { TemplateModeUiItem } from "@/types/api/template-modes";

export function templateModeLabel(mode: TemplateModeUiItem): string {
  return mode.name?.trim() || `Template mode ${mode.id}`;
}
