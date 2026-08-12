"use client";

import { Check, Plus } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { CSSProperties, ReactNode } from "react";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_CLASS =
  "bg-card text-card-foreground hover:bg-muted/30 focus-visible:ring-primary flex h-[72px] w-[144px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-border p-2 text-center transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none sm:h-[80px] sm:w-[160px]";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_VERTICAL_CLASS =
  "bg-card text-card-foreground hover:bg-muted/30 focus-visible:ring-primary flex h-[72px] w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-border p-2 text-center transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none sm:h-[80px]";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SELECTED_CLASS =
  "bg-[color-mix(in_oklab,var(--success)_12%,var(--card))] text-[color-mix(in_oklab,var(--success)_55%,var(--foreground))] hover:bg-[color-mix(in_oklab,var(--success)_16%,var(--card))] ring-[color-mix(in_oklab,var(--success)_35%,transparent)] ring-2 ring-inset";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS =
  "relative overflow-hidden rounded-lg p-0 hover:opacity-95";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS =
  "ring-(--success) ring-2 ring-inset";

export function TemplateBuilderSelectableTileIcon({
  isSelected,
  onColorfulBackground = false,
}: {
  isSelected: boolean;
  onColorfulBackground?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border",
        isSelected
          ? "border-[color-mix(in_oklab,var(--success)_40%,transparent)] bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-(--success)"
          : onColorfulBackground
            ? "border-white/70 bg-black/35 text-white backdrop-blur-[1px]"
            : "border-border text-muted-foreground border-dashed",
      )}
      aria-hidden
    >
      {isSelected ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Plus className="size-3.5" strokeWidth={2} />
      )}
    </span>
  );
}

export function TemplateBuilderSelectableTileCheckBadge() {
  return (
    <span
      className="text-background absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-(--success) shadow-sm"
      aria-hidden
    >
      <Check className="size-3" strokeWidth={2.5} />
    </span>
  );
}

function renderTileContent({
  item,
  isSelected,
  isSplitTile,
  usesSplitIconCards,
  renderVisual,
  renderTileBackdrop,
}: {
  item: { id: number; title: string };
  isSelected: boolean;
  isSplitTile: boolean;
  usesSplitIconCards: boolean;
  renderVisual?: (item: { id: number; title: string }, isSelected: boolean) => ReactNode;
  renderTileBackdrop?: (item: { id: number; title: string }, isSelected: boolean) => ReactNode;
}) {
  return (
    <>
      {renderTileBackdrop != null ? (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
          aria-hidden
        >
          {renderTileBackdrop(item, isSelected)}
        </span>
      ) : null}
      {isSplitTile && !usesSplitIconCards ? (
        <>
          {isSelected ? <TemplateBuilderSelectableTileCheckBadge /> : null}
          <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/45 px-1 py-0.5">
            <span className="line-clamp-2 text-[0.65rem] leading-tight font-semibold">
              {item.title}
            </span>
          </span>
        </>
      ) : isSplitTile && usesSplitIconCards ? (
        <span className="relative z-10 flex h-full flex-col items-center justify-center gap-1.5 p-2">
          <span className="line-clamp-2 text-[0.65rem] leading-tight font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
            {item.title}
          </span>
          {renderVisual ? (
            renderVisual(item, isSelected)
          ) : (
            <TemplateBuilderSelectableTileIcon isSelected={isSelected} onColorfulBackground />
          )}
        </span>
      ) : (
        <>
          <span className="line-clamp-2 text-[0.65rem] leading-tight font-semibold">
            {item.title}
          </span>
          {renderVisual ? (
            renderVisual(item, isSelected)
          ) : (
            <TemplateBuilderSelectableTileIcon isSelected={isSelected} />
          )}
        </>
      )}
    </>
  );
}

export function TemplateBuilderSelectableTilePicker({
  label,
  groupAriaLabel,
  items,
  selectedId,
  isChanged: _isChanged,
  onSelect,
  emptyMessage = "No options available.",
  renderVisual,
  renderTileBackdrop,
  getTileBackgroundStyle,
  selectedTileClassName,
  hideHeader = false,
  splitBackgroundVariant = "overlay",
  centerTiles = false,
  orientation = "horizontal",
  scrollClassName,
  embedded = false,
}: {
  label: string;
  groupAriaLabel: string;
  items: Array<{ id: number; title: string }>;
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  emptyMessage?: string;
  renderVisual?: (item: { id: number; title: string }, isSelected: boolean) => ReactNode;
  renderTileBackdrop?: (item: { id: number; title: string }, isSelected: boolean) => ReactNode;
  getTileBackgroundStyle?: (
    item: { id: number; title: string },
    isSelected: boolean,
  ) => CSSProperties | undefined;
  selectedTileClassName?: string;
  hideHeader?: boolean;
  splitBackgroundVariant?: "overlay" | "icon";
  centerTiles?: boolean;
  /** `vertical` uses shadcn ScrollArea; default stays a horizontal strip. */
  orientation?: "horizontal" | "vertical";
  /** Max height / sizing for the vertical ScrollArea viewport. */
  scrollClassName?: string;
  /** When true, vertical tiles render in a plain grid (no inner ScrollArea). */
  embedded?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const usesSplitBackground = getTileBackgroundStyle != null;
  const usesSplitIconCards = usesSplitBackground && splitBackgroundVariant === "icon";
  const resolvedSelectedClassName =
    selectedTileClassName ??
    (usesSplitBackground
      ? TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS
      : TEMPLATE_BUILDER_SELECTABLE_TILE_SELECTED_CLASS);
  const isVertical = orientation === "vertical";
  const tileSurfaceClass = isVertical
    ? TEMPLATE_BUILDER_SELECTABLE_TILE_VERTICAL_CLASS
    : TEMPLATE_BUILDER_SELECTABLE_TILE_CLASS;

  const tiles = items.map((item) => {
    const isSelected = item.id === selectedId;
    const tileBackgroundStyle = getTileBackgroundStyle?.(item, isSelected);
    const isSplitTile = tileBackgroundStyle != null;

    return (
      <button
        key={item.id}
        type="button"
        aria-label={`${item.title}. ${isSelected ? "Selected" : "Choose"}`}
        aria-pressed={isSelected}
        onClick={() => onSelect(item.id)}
        style={tileBackgroundStyle}
        className={cn(
          tileSurfaceClass,
          isSplitTile && TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS,
          isSplitTile && "bg-transparent text-white hover:bg-transparent",
          isSelected && resolvedSelectedClassName,
        )}
      >
        {renderTileContent({
          item,
          isSelected,
          isSplitTile,
          usesSplitIconCards,
          ...(renderVisual !== undefined ? { renderVisual } : {}),
          ...(renderTileBackdrop !== undefined ? { renderTileBackdrop } : {}),
        })}
      </button>
    );
  });

  return (
    <div className={cn("grid gap-3", (centerTiles || isVertical) && "w-full")}>
      {hideHeader ? null : (
        <div className={cn(centerTiles && !isVertical && "text-center")}>
          <p className="text-sm font-medium">{label}</p>
        </div>
      )}

      {isVertical ? (
        embedded ? (
          <div role="group" aria-label={groupAriaLabel} className="grid grid-cols-2 gap-1.5">
            {tiles}
          </div>
        ) : (
          <ScrollArea
            className={cn("w-full pr-2", scrollClassName ?? "h-[min(50vh,22rem)]")}
            aria-label={groupAriaLabel}
          >
            <div role="group" aria-label={groupAriaLabel} className="grid grid-cols-2 gap-1.5 pb-1">
              {tiles}
            </div>
          </ScrollArea>
        )
      ) : (
        <div role="group" aria-label={groupAriaLabel} className="min-w-0 overflow-x-auto py-1">
          <div
            className={cn("flex w-max flex-nowrap gap-1.5", centerTiles ? "mx-auto" : "min-w-full")}
          >
            {tiles}
          </div>
        </div>
      )}
    </div>
  );
}
