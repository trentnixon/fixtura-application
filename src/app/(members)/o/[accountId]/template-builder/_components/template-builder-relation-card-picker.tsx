"use client";

import { useMemo } from "react";

import { TemplateBuilderSelectableTilePicker } from "./template-builder-selectable-tile-picker";

export function TemplateBuilderRelationCardPicker<T extends { id: number }>({
  label,
  items,
  formatItemLabel,
  selectedId,
  isChanged,
  onSelect,
  emptyMessage,
  centerTiles = false,
}: {
  label: string;
  items: T[];
  formatItemLabel: (item: T) => string;
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  emptyMessage?: string;
  centerTiles?: boolean;
}) {
  const tileItems = useMemo(
    () => items.map((item) => ({ id: item.id, title: formatItemLabel(item) })),
    [formatItemLabel, items],
  );

  return (
    <TemplateBuilderSelectableTilePicker
      hideHeader
      label={label}
      groupAriaLabel={label}
      items={tileItems}
      selectedId={selectedId}
      isChanged={isChanged}
      onSelect={onSelect}
      emptyMessage={emptyMessage ?? `No ${label.toLowerCase()} options available.`}
      centerTiles={centerTiles}
    />
  );
}
