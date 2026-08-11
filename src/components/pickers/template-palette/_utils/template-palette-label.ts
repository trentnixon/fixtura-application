import type { TemplatePaletteUiItem } from "@/types/api/template-palettes";

export function templatePaletteLabel(palette: TemplatePaletteUiItem): string {
  return palette.name?.trim() || `Template palette ${palette.id}`;
}
