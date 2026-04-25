import type { TemplateVideoUiItem } from "@/types/api/template-videos";

export function templateVideoLabel(video: TemplateVideoUiItem): string {
  return video.name?.trim() ? video.name : `Template video ${video.id}`;
}
