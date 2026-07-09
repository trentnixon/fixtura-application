"use client";

import { useMemo } from "react";

import {
  resolveRemotionPaletteLayoutColors,
  resolveRemotionTexturePreviewLayers,
} from "@/features/remotion-asset-preview";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { AccountBrandingData } from "@/types/api/account";
import type {
  TemplatePaletteItem,
  TemplateTextureCatalogItem,
} from "@/types/api/all-template-options";

function findPaletteById(
  palettes: TemplatePaletteItem[],
  paletteId: number | null,
): TemplatePaletteItem | null {
  if (paletteId === null) return null;
  return palettes.find((palette) => palette.id === paletteId) ?? null;
}

export function TemplateBuilderTextureCardPicker({
  branding,
  palettes,
  selectedPaletteId,
  items,
  selectedId,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  branding: AccountBrandingData | null;
  palettes: TemplatePaletteItem[];
  selectedPaletteId: number | null;
  items: TemplateTextureCatalogItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const brandColors = useMemo(
    () => themeColoursFromAccountBrandingTheme(branding?.theme ?? null),
    [branding?.theme],
  );

  const overlayColor = useMemo(() => {
    const palette = findPaletteById(palettes, selectedPaletteId);
    const layout = palette ? resolveRemotionPaletteLayoutColors(palette, brandColors) : null;
    return layout?.left ?? brandColors.primary;
  }, [brandColors, palettes, selectedPaletteId]);

  const previewLayersById = useMemo(() => {
    const map = new Map<
      number,
      NonNullable<ReturnType<typeof resolveRemotionTexturePreviewLayers>>
    >();
    for (const item of items) {
      const layers = resolveRemotionTexturePreviewLayers(item, overlayColor);
      if (layers != null) map.set(item.id, layers);
    }
    return map;
  }, [items, overlayColor]);

  const tileItems = items.map((item) => ({
    id: item.id,
    title: formatCatalogItemLabel(item),
  }));

  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label="Texture"
      groupAriaLabel="Texture"
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage="No textures available."
      centerTiles={centerTiles}
      splitBackgroundVariant="icon"
      getTileBackgroundStyle={(item) => (previewLayersById.has(item.id) ? {} : undefined)}
      renderTileBackdrop={(item) => {
        const layers = previewLayersById.get(item.id);
        if (layers == null) return null;

        return (
          <>
            <span className="absolute inset-0" style={layers.textureLayer} />
            <span className="absolute inset-0" style={layers.overlayLayer} />
          </>
        );
      }}
    />
  );
}
