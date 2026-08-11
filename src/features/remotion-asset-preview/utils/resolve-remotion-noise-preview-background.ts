import { resolveRemotionNoiseTypeFromCatalogItem } from "./read-remotion-noise-from-catalog";
import { drawRemotionNoisePreviewToDataUrl } from "./resolve-remotion-noise-grid-preview";
import { resolveRemotionNoiseStaticPreviewUrl } from "./resolve-remotion-noise-static-preview-url";

import type { TemplateNoiseItem } from "@/types/api/all-template-options";
import type { CSSProperties } from "react";

export type RemotionNoisePreviewColors = {
  base: string;
  accent: string;
};

function noisePreviewBackgroundStyle(backgroundImage: string, baseColor: string): CSSProperties {
  return {
    backgroundColor: baseColor,
    backgroundImage: `url("${backgroundImage}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function resolveRemotionNoisePreviewBackground(
  item: TemplateNoiseItem,
  colors: RemotionNoisePreviewColors,
): CSSProperties | undefined {
  const type = resolveRemotionNoiseTypeFromCatalogItem(item);
  if (type === null) return undefined;

  const dataUrl = drawRemotionNoisePreviewToDataUrl({
    variant: type,
    baseColor: colors.base,
    accentColor: colors.accent,
  });
  if (dataUrl != null) {
    return noisePreviewBackgroundStyle(dataUrl, colors.base);
  }

  const staticUrl = resolveRemotionNoiseStaticPreviewUrl(type);
  if (staticUrl != null) {
    return noisePreviewBackgroundStyle(staticUrl, colors.base);
  }

  return undefined;
}
