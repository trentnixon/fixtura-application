"use client";

import { useMemo } from "react";

import {
  resolveRemotionGradientPreviewBackground,
  resolveRemotionPaletteLayoutColors,
} from "@/features/remotion-asset-preview";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateGradientItem, TemplatePaletteItem } from "@/types/api/all-template-options";

function findPaletteById(
  palettes: TemplatePaletteItem[],
  paletteId: number | null,
): TemplatePaletteItem | null {
  if (paletteId === null) return null;
  return palettes.find((palette) => palette.id === paletteId) ?? null;
}

export function TemplateBuilderGradientCardPicker({
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
  items: TemplateGradientItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const brandColors = useMemo(
    () => themeColoursFromAccountBrandingTheme(branding?.theme ?? null),
    [branding?.theme],
  );

  const palettePreview = useMemo(() => {
    const palette = findPaletteById(palettes, selectedPaletteId);
    const layout = palette ? resolveRemotionPaletteLayoutColors(palette, brandColors) : null;

    return {
      main: layout?.left ?? brandColors.primary,
      secondary: layout?.right ?? brandColors.secondary,
      paletteKey: layout?.key ?? null,
    };
  }, [brandColors, palettes, selectedPaletteId]);

  const gradientBackgroundById = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of items) {
      const background = resolveRemotionGradientPreviewBackground(
        item,
        palettePreview.main,
        palettePreview.secondary,
        palettePreview.paletteKey,
      );
      if (background != null) map.set(item.id, background);
    }
    return map;
  }, [items, palettePreview]);

  const tileItems = items.map((item) => ({
    id: item.id,
    title: formatCatalogItemLabel(item),
  }));

  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label="Gradient"
      groupAriaLabel="Gradient"
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage="No gradients available."
      centerTiles={centerTiles}
      splitBackgroundVariant="icon"
      getTileBackgroundStyle={(item) => {
        const background = gradientBackgroundById.get(item.id);
        if (background == null) return undefined;
        return { background };
      }}
    />
  );
}
