"use client";

import { useMemo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  resolveRemotionPaletteLayoutColors,
  resolveRemotionTexturePreviewLayers,
} from "@/features/remotion-asset-preview";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { TemplateTextureCategoryGroup } from "../_utils/template-builder-texture-catalog";
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

function useTextureTilePreviewState({
  branding,
  palettes,
  selectedPaletteId,
  items,
}: {
  branding: AccountBrandingData | null;
  palettes: TemplatePaletteItem[];
  selectedPaletteId: number | null;
  items: TemplateTextureCatalogItem[];
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

  return previewLayersById;
}

function TemplateBuilderTextureTilePicker({
  items,
  selectedId,
  isChanged,
  onSelect,
  centerTiles,
  previewLayersById,
  embedded = false,
}: {
  items: TemplateTextureCatalogItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles: boolean;
  previewLayersById: Map<
    number,
    NonNullable<ReturnType<typeof resolveRemotionTexturePreviewLayers>>
  >;
  embedded?: boolean;
}) {
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
      orientation="vertical"
      scrollClassName={embedded ? "" : "h-[min(40vh,16rem)]"}
      embedded={embedded}
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

export function TemplateBuilderTextureCardPicker({
  branding,
  palettes,
  selectedPaletteId,
  items,
  groups,
  selectedId,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  branding: AccountBrandingData | null;
  palettes: TemplatePaletteItem[];
  selectedPaletteId: number | null;
  items: TemplateTextureCatalogItem[];
  groups?: TemplateTextureCategoryGroup[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const previewLayersById = useTextureTilePreviewState({
    branding,
    palettes,
    selectedPaletteId,
    items,
  });

  if (groups && groups.length > 0) {
    return (
      <ScrollArea className="h-[min(40vh,16rem)] w-full pr-2" aria-label="Texture categories">
        <div className="grid gap-4 pb-1">
          {groups.map((group) => (
            <section
              key={group.key}
              className="grid gap-2"
              aria-labelledby={`texture-group-${group.key}`}
            >
              <h3
                id={`texture-group-${group.key}`}
                className="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
              >
                {group.label}
              </h3>
              <TemplateBuilderTextureTilePicker
                items={group.items}
                selectedId={selectedId}
                isChanged={isChanged}
                onSelect={onSelect}
                centerTiles={centerTiles}
                previewLayersById={previewLayersById}
                embedded
              />
            </section>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <TemplateBuilderTextureTilePicker
      items={items}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      centerTiles={centerTiles}
      previewLayersById={previewLayersById}
    />
  );
}
