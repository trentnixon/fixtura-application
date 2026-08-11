import type { TemplateTextureCatalogItem } from "@/types/api/all-template-options";
import type { CSSProperties } from "react";

export const REMOTION_TEXTURE_DEFAULT_OVERLAY_OPACITY = 0.35;
export const REMOTION_TEXTURE_DEFAULT_BLEND_MODE = "multiply";

export type RemotionTexturePreviewLayers = {
  textureLayer: CSSProperties;
  overlayLayer: CSSProperties;
};

function resolveTextureUrl(item: TemplateTextureCatalogItem): string | null {
  const url = item.texture?.url?.trim();
  return url ? url : null;
}

function resolveTextureOpacity(opacity: number | null): number {
  if (opacity === null || !Number.isFinite(opacity)) {
    return REMOTION_TEXTURE_DEFAULT_OVERLAY_OPACITY;
  }

  return Math.min(1, Math.max(0, opacity));
}

function resolveTextureBlendMode(blendMode: string | null): CSSProperties["mixBlendMode"] {
  const normalized = blendMode?.trim().toLowerCase();
  if (
    normalized === "multiply" ||
    normalized === "screen" ||
    normalized === "overlay" ||
    normalized === "darken" ||
    normalized === "lighten" ||
    normalized === "color-dodge" ||
    normalized === "color-burn" ||
    normalized === "hard-light" ||
    normalized === "soft-light" ||
    normalized === "difference" ||
    normalized === "exclusion" ||
    normalized === "hue" ||
    normalized === "saturation" ||
    normalized === "color" ||
    normalized === "luminosity"
  ) {
    return normalized;
  }

  return REMOTION_TEXTURE_DEFAULT_BLEND_MODE;
}

/**
 * Layer styles for a template-builder texture tile.
 * Mirrors Remotion TextureBackground: texture image with brand-color overlay on top.
 */
export function resolveRemotionTexturePreviewLayers(
  item: TemplateTextureCatalogItem,
  overlayColor: string,
): RemotionTexturePreviewLayers | null {
  const url = resolveTextureUrl(item);
  if (url === null) return null;

  const opacity = resolveTextureOpacity(item.opacity);
  const blendMode = resolveTextureBlendMode(item.blendMode);

  return {
    textureLayer: {
      backgroundImage: `url("${url}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    overlayLayer: {
      backgroundColor: overlayColor,
      opacity,
      mixBlendMode: blendMode,
    },
  };
}
