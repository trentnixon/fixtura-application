import type { TemplateTextureUiItem } from "@/types/api/template-textures";

export function templateTextureLabel(texture: TemplateTextureUiItem): string {
  return texture.name ?? `Template texture ${texture.id}`;
}
