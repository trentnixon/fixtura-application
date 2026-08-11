import type { TemplateImageUiItem } from "@/types/api/template-images";

export function templateImageLabel(img: TemplateImageUiItem): string {
  return img.name?.trim() || `Template image ${img.id}`;
}
