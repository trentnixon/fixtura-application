"use client";

import { useMemo } from "react";

import {
  remotionPaletteLayoutSplitBackground,
  resolveRemotionPaletteLayoutColors,
} from "@/features/remotion-asset-preview/utils/resolve-remotion-palette-layout-colors";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { cn } from "@/lib/utils";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { filterColorLayoutPalettes } from "../_utils/template-builder-color-layout-palettes";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplatePaletteItem } from "@/types/api/all-template-options";

export function TemplateBuilderPaletteCardPicker({
  branding,
  items,
  selectedId,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  branding: AccountBrandingData | null;
  items: TemplatePaletteItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const theme = branding?.theme ?? null;
  const brandColors = useMemo(() => themeColoursFromAccountBrandingTheme(theme), [theme]);

  const visiblePalettes = useMemo(
    () => filterColorLayoutPalettes(items, selectedId),
    [items, selectedId],
  );

  const layoutColorsById = useMemo(() => {
    const map = new Map<number, ReturnType<typeof resolveRemotionPaletteLayoutColors>>();
    for (const palette of visiblePalettes) {
      map.set(palette.id, resolveRemotionPaletteLayoutColors(palette, brandColors));
    }
    return map;
  }, [brandColors, visiblePalettes]);

  const tileItems = visiblePalettes.map((palette) => ({
    id: palette.id,
    title: formatCatalogItemLabel(palette),
  }));

  return (
    <div className={cn("grid gap-3", centerTiles && "w-full")}>
      <TemplateBuilderSelectableTilePicker
        hideHeader
        label="Color Layout"
        groupAriaLabel="Color Layout"
        items={tileItems}
        selectedId={selectedId}
        isChanged={isChanged}
        onSelect={onSelect}
        emptyMessage="No color layouts available."
        centerTiles={centerTiles}
        splitBackgroundVariant="icon"
        getTileBackgroundStyle={(item) => {
          const layout = layoutColorsById.get(item.id);
          if (layout == null) return undefined;
          return {
            background: remotionPaletteLayoutSplitBackground(layout.left, layout.right),
          };
        }}
      />
    </div>
  );
}
