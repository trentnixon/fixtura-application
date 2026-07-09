"use client";

import { useEffect, useMemo, useState } from "react";

import {
  resolveRemotionNoisePreviewBackground,
  resolveRemotionPaletteLayoutColors,
} from "@/features/remotion-asset-preview";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateNoiseItem, TemplatePaletteItem } from "@/types/api/all-template-options";
import type { CSSProperties } from "react";

function findPaletteById(
  palettes: TemplatePaletteItem[],
  paletteId: number | null,
): TemplatePaletteItem | null {
  if (paletteId === null) return null;
  return palettes.find((palette) => palette.id === paletteId) ?? null;
}

export function TemplateBuilderNoiseCardPicker({
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
  items: TemplateNoiseItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const brandColors = useMemo(
    () => themeColoursFromAccountBrandingTheme(branding?.theme ?? null),
    [branding?.theme],
  );

  const previewColors = useMemo(() => {
    const palette = findPaletteById(palettes, selectedPaletteId);
    const layout = palette ? resolveRemotionPaletteLayoutColors(palette, brandColors) : null;

    return {
      base: layout?.left ?? brandColors.primary,
      accent: layout?.right ?? brandColors.secondary,
    };
  }, [brandColors, palettes, selectedPaletteId]);

  const [previewById, setPreviewById] = useState<Map<number, CSSProperties>>(() => new Map());

  useEffect(() => {
    const map = new Map<number, CSSProperties>();
    for (const item of items) {
      const background = resolveRemotionNoisePreviewBackground(item, previewColors);
      if (background != null) map.set(item.id, background);
    }
    setPreviewById(map);
  }, [items, previewColors]);

  const tileItems = items.map((item) => ({
    id: item.id,
    title: formatCatalogItemLabel(item),
  }));

  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label="Noise"
      groupAriaLabel="Noise"
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage="No noise options available."
      centerTiles={centerTiles}
      splitBackgroundVariant="icon"
      getTileBackgroundStyle={(item) => previewById.get(item.id)}
    />
  );
}
