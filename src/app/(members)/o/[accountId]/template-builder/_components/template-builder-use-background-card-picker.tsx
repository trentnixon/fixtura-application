"use client";

import { useMemo } from "react";

import {
  TEMPLATE_USE_BACKGROUND_VALUES,
  type TemplateUseBackground,
} from "@/types/api/template-options";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";
import { formatUseBackgroundLabel } from "../_utils/template-builder-option-labels";

const HIDDEN_USE_BACKGROUND_VALUES = new Set<TemplateUseBackground>(["Video"]);

const USE_BACKGROUND_TILE_ITEMS = TEMPLATE_USE_BACKGROUND_VALUES.filter(
  (value) => !HIDDEN_USE_BACKGROUND_VALUES.has(value),
).map((value, index) => ({
  id: index + 1,
  value,
  title: formatUseBackgroundLabel(value),
}));

function backgroundToTileId(value: TemplateUseBackground | null): number | null {
  if (value === null) return null;
  return USE_BACKGROUND_TILE_ITEMS.find((tile) => tile.value === value)?.id ?? null;
}

function tileIdToUseBackground(id: number): TemplateUseBackground | null {
  return USE_BACKGROUND_TILE_ITEMS.find((tile) => tile.id === id)?.value ?? null;
}

export function TemplateBuilderUseBackgroundCardPicker({
  selectedValue,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  selectedValue: TemplateUseBackground | null;
  isChanged: boolean;
  onSelect: (value: TemplateUseBackground | null) => void;
  centerTiles?: boolean;
}) {
  const selectedId = useMemo(() => backgroundToTileId(selectedValue), [selectedValue]);

  const tileItems = useMemo(
    () => USE_BACKGROUND_TILE_ITEMS.map(({ id, title }) => ({ id, title })),
    [],
  );

  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label="Use background"
      groupAriaLabel="Use background"
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={(id) => onSelect(tileIdToUseBackground(id))}
      emptyMessage="No background types available."
      centerTiles={centerTiles}
    />
  );
}
