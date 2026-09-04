import { formatTemplateUseBackgroundLabel } from "./template-builder-use-background-helpers";

import type {
  TemplateCategoryCatalogItem,
  TemplateGradientItem,
  TemplateImageItem,
  TemplateModeItem,
  TemplateNoiseItem,
  TemplatePaletteItem,
  TemplateParticleItem,
  TemplatePatternItem,
  TemplateTextureCatalogItem,
  TemplateVideoItem,
} from "@/types/api/all-template-options";
import type { TemplateUseBackgroundRead } from "@/types/api/template-options";

type CatalogLabelItem = {
  id: number;
  name?: string | null;
  slug?: string | null;
  value?: string | null;
};

export function formatCatalogItemLabel(item: CatalogLabelItem): string {
  const name = item.name?.trim();
  if (name) return name;
  const slug = item.slug?.trim();
  if (slug) return slug;
  const value = item.value?.trim();
  if (value) return value;
  return String(item.id);
}

export function formatCategoryLabel(category: TemplateCategoryCatalogItem): string {
  return formatCatalogItemLabel(category);
}

export function formatModeLabel(mode: TemplateModeItem): string {
  return formatCatalogItemLabel(mode);
}

export function formatPaletteLabel(palette: TemplatePaletteItem): string {
  const base = formatCatalogItemLabel(palette);
  const v = palette.value?.trim();
  if (v && v !== base) return `${base} (${v})`;
  return base;
}

export function formatGradientLabel(gradient: TemplateGradientItem): string {
  return formatCatalogItemLabel(gradient);
}

export function formatImageLabel(image: TemplateImageItem): string {
  return formatCatalogItemLabel(image);
}

export function formatNoiseLabel(noise: TemplateNoiseItem): string {
  return formatCatalogItemLabel(noise);
}

export function formatParticleLabel(particle: TemplateParticleItem): string {
  return formatCatalogItemLabel(particle);
}

export function formatPatternLabel(pattern: TemplatePatternItem): string {
  return formatCatalogItemLabel(pattern);
}

export function formatTextureLabel(texture: TemplateTextureCatalogItem): string {
  const base = formatCatalogItemLabel({ id: texture.id, name: texture.name });
  const media = texture.texture;
  if (media?.mime?.trim()) return `${base} - ${media.mime.trim()}`;
  if (media?.url?.trim()) return `${base} - ${media.url.trim()}`;
  return base;
}

export function formatVideoLabel(video: TemplateVideoItem): string {
  const base = formatCatalogItemLabel({ id: video.id, name: video.name });
  const parts = [video.position?.trim(), video.size?.trim()].filter((p): p is string => Boolean(p));
  if (parts.length === 0) return base;
  return `${base} (${parts.join(", ")})`;
}

export function formatSavedOptionLabel(id: number | null, resolvedLabel: string | null): string {
  if (id === null) return "Unset";
  return resolvedLabel ?? `ID ${id}`;
}

/** Label for the CMS-saved value shown as the baseline on required pickers (e.g. Category). */
export function formatOriginalSettingLabel(
  id: number | null,
  resolvedLabel: string | null,
): string {
  if (id === null) return "Not set";
  return resolvedLabel ?? `ID ${id}`;
}

export function formatUseBackgroundLabel(value: TemplateUseBackgroundRead | null): string {
  return formatTemplateUseBackgroundLabel(value);
}
