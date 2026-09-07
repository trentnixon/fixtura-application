import { resolvePreviewMediaUrl } from "@/features/remotion-asset-preview/utils/resolve-preview-media-url";
import { toNumberOrNull } from "@/types/api/template-textures";

import type { TemplateTextureCatalogItem } from "@/types/api/all-template-options";
import type { TemplateTextureCategory, TemplateTextureUiItem } from "@/types/api/template-textures";

export type TemplateBuilderTexturePickerItem = TemplateTextureCatalogItem & {
  category: TemplateTextureCategory | null;
};

export type TemplateTextureCategoryGroup = {
  key: string;
  label: string;
  items: TemplateBuilderTexturePickerItem[];
};

const TEMPLATE_TEXTURE_CATEGORY_ORDER: TemplateTextureCategory[] = [
  "Paper",
  "Print",
  "Turf",
  "Infrastructure",
  "Metal",
  "Stadium",
];

const UNCategorized_TEXTURE_GROUP_KEY = "uncategorized";
const UNCategorized_TEXTURE_GROUP_LABEL = "Other";

export function mapTemplateTextureUiItemToPickerItem(
  item: TemplateTextureUiItem,
): TemplateBuilderTexturePickerItem {
  const media = item.texture;
  const resolvedUrl = resolvePreviewMediaUrl(media?.url ?? null);

  return {
    id: item.id,
    name: item.name,
    category: item.category ?? null,
    opacity: toNumberOrNull(item.opacity),
    blendMode: item.blendMode,
    texture:
      media === null
        ? null
        : {
            ...media,
            url: resolvedUrl,
          },
  };
}

export function mapTemplateTexturesUiToPickerItems(
  items: TemplateTextureUiItem[],
): TemplateBuilderTexturePickerItem[] {
  return items.map(mapTemplateTextureUiItemToPickerItem);
}

export function mapCatalogTextureToPickerItem(
  item: TemplateTextureCatalogItem,
): TemplateBuilderTexturePickerItem {
  const media = item.texture;
  const resolvedUrl = resolvePreviewMediaUrl(media?.url ?? null);

  return {
    id: item.id,
    name: item.name,
    category: null,
    opacity: item.opacity,
    blendMode: item.blendMode,
    texture:
      media === null
        ? null
        : {
            ...media,
            url: resolvedUrl,
          },
  };
}

export function mapCatalogTexturesToPickerItems(
  items: TemplateTextureCatalogItem[],
): TemplateBuilderTexturePickerItem[] {
  return items.map(mapCatalogTextureToPickerItem);
}

export const TEMPLATE_TEXTURE_UI_PERMISSION_HINT =
  "Template textures are unavailable from the UI catalog. Ask ops to enable Strapi permission Template-texture → getTemplateTexturesForUi for the Authenticated role.";

export function templateTextureCategoryLabel(category: TemplateTextureCategory | null): string {
  if (category === null) return UNCategorized_TEXTURE_GROUP_LABEL;
  return category;
}

export function groupTemplateTexturesByCategory(
  items: TemplateBuilderTexturePickerItem[],
): TemplateTextureCategoryGroup[] {
  const byCategory = new Map<string, TemplateBuilderTexturePickerItem[]>();

  for (const item of items) {
    const key = item.category ?? UNCategorized_TEXTURE_GROUP_KEY;
    const bucket = byCategory.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      byCategory.set(key, [item]);
    }
  }

  const groups: TemplateTextureCategoryGroup[] = [];

  for (const category of TEMPLATE_TEXTURE_CATEGORY_ORDER) {
    const bucket = byCategory.get(category);
    if (bucket && bucket.length > 0) {
      groups.push({
        key: category,
        label: category,
        items: bucket,
      });
      byCategory.delete(category);
    }
  }

  const uncategorized = byCategory.get(UNCategorized_TEXTURE_GROUP_KEY);
  if (uncategorized && uncategorized.length > 0) {
    groups.push({
      key: UNCategorized_TEXTURE_GROUP_KEY,
      label: UNCategorized_TEXTURE_GROUP_LABEL,
      items: uncategorized,
    });
    byCategory.delete(UNCategorized_TEXTURE_GROUP_KEY);
  }

  for (const [key, bucket] of byCategory) {
    if (bucket.length === 0) continue;
    groups.push({
      key,
      label: key,
      items: bucket,
    });
  }

  return groups;
}

export function resolveTemplateTextureCatalogItem(
  textureId: number | null,
  textureCatalog: TemplateBuilderTexturePickerItem[] | null | undefined,
  fallbackCatalog: TemplateTextureCatalogItem[],
  currentSelectionTexture: TemplateTextureCatalogItem | null | undefined,
): TemplateBuilderTexturePickerItem | TemplateTextureCatalogItem | null {
  if (textureId === null) return null;

  const fromUi = textureCatalog?.find((item) => item.id === textureId) ?? null;
  if (fromUi !== null) return fromUi;

  const fromFatCatalog = fallbackCatalog.find((item) => item.id === textureId) ?? null;
  if (fromFatCatalog !== null) {
    return { ...fromFatCatalog, category: null };
  }

  if (currentSelectionTexture?.id === textureId) {
    return { ...currentSelectionTexture, category: null };
  }

  return null;
}
