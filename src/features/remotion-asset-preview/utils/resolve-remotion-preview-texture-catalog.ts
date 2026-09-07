import { ApiError } from "@/lib/api/client/api-error";
import { toNumberOrNull } from "@/types/api/template-textures";

import { resolvePreviewMediaUrl } from "./resolve-preview-media-url";

import type { TemplateTextureCatalogItem } from "@/types/api/all-template-options";
import type { TemplateTextureUiItem } from "@/types/api/template-textures";

export type RemotionPreviewTextureCatalogItem = TemplateTextureCatalogItem & {
  category?: string | null;
};

function mapTextureUiItem(item: TemplateTextureUiItem): RemotionPreviewTextureCatalogItem {
  const media = item.texture;
  const resolvedUrl = resolvePreviewMediaUrl(media?.url ?? null);

  return {
    id: item.id,
    name: item.name,
    opacity: toNumberOrNull(item.opacity),
    blendMode: item.blendMode,
    category: item.category ?? null,
    texture:
      media === null
        ? null
        : {
            ...media,
            url: resolvedUrl,
          },
  };
}

function mapCatalogTexture(item: TemplateTextureCatalogItem): RemotionPreviewTextureCatalogItem {
  const media = item.texture;
  const resolvedUrl = resolvePreviewMediaUrl(media?.url ?? null);

  return {
    id: item.id,
    name: item.name,
    opacity: item.opacity,
    blendMode: item.blendMode,
    category: null,
    texture:
      media === null
        ? null
        : {
            ...media,
            url: resolvedUrl,
          },
  };
}

export type ResolveRemotionPreviewTextureCatalogInput = {
  templateTexturesSuccess: boolean;
  templateTexturesPending: boolean;
  templateTexturesData: TemplateTextureUiItem[] | null | undefined;
  templateTexturesError: unknown;
  catalogTextures: TemplateTextureCatalogItem[] | null | undefined;
};

/** Same texture resolution order as template builder preview (UI catalog, then aggregate catalog). */
export function resolveRemotionPreviewTextureCatalog({
  templateTexturesSuccess,
  templateTexturesPending,
  templateTexturesData,
  templateTexturesError,
  catalogTextures,
}: ResolveRemotionPreviewTextureCatalogInput): RemotionPreviewTextureCatalogItem[] {
  if (templateTexturesSuccess) {
    return (templateTexturesData ?? []).map(mapTextureUiItem);
  }

  if (templateTexturesPending) {
    return [];
  }

  const fallbackItems = catalogTextures?.map(mapCatalogTexture) ?? [];
  if (fallbackItems.length > 0) {
    return fallbackItems;
  }

  if (templateTexturesError instanceof ApiError && templateTexturesError.status === 403) {
    return [];
  }

  return [];
}
