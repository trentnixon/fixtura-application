"use client";

import { useMemo } from "react";

import {
  remotionPaletteLayoutSplitBackground,
  resolveRemotionPaletteLayoutColors,
} from "@/features/remotion-asset-preview/utils/resolve-remotion-palette-layout-colors";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import {
  TemplateBuilderSelectableTileIcon,
  TemplateBuilderSelectableTilePicker,
} from "./template-builder-selectable-tile-picker";
import { formatCatalogItemLabel } from "../_utils/template-builder-option-labels";

import type { AccountBrandingTheme } from "@/types/api/account";
import type { TemplatePaletteItem } from "@/types/api/all-template-options";

export function TemplateBuilderPaletteCardPicker({
  items,
  theme,
  selectedId,
  isChanged,
  onSelect,
}: {
  items: TemplatePaletteItem[];
  theme: AccountBrandingTheme | null;
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
}) {
  const brandColors = useMemo(() => themeColoursFromAccountBrandingTheme(theme), [theme]);

  const layoutColorsById = useMemo(() => {
    const map = new Map<number, ReturnType<typeof resolveRemotionPaletteLayoutColors>>();
    for (const palette of items) {
      map.set(palette.id, resolveRemotionPaletteLayoutColors(palette, brandColors));
    }
    return map;
  }, [brandColors, items]);

  const tileItems = items.map((palette) => ({
    id: palette.id,
    title: formatCatalogItemLabel(palette),
  }));

  return (
    <TemplateBuilderSelectableTilePicker
      label="Color Layout"
      groupAriaLabel="Color Layout"
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage="No color layouts available."
      getTileBackgroundStyle={(item) => {
        const layout = layoutColorsById.get(item.id);
        if (layout == null) return undefined;
        return {
          background: remotionPaletteLayoutSplitBackground(layout.left, layout.right),
        };
      }}
      renderVisual={(item, isSelected) => {
        if (layoutColorsById.get(item.id) != null) return null;
        return <TemplateBuilderSelectableTileIcon isSelected={isSelected} />;
      }}
    />
  );
}
