"use client";

import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CSSProperties, ReactNode } from "react";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_CLASS =
  "bg-card text-card-foreground hover:bg-muted/30 focus-visible:ring-primary flex size-[150px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-border p-2.5 text-center transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SELECTED_CLASS =
  "bg-[color-mix(in_oklab,var(--success)_12%,var(--card))] text-[color-mix(in_oklab,var(--success)_55%,var(--foreground))] hover:bg-[color-mix(in_oklab,var(--success)_16%,var(--card))] ring-[color-mix(in_oklab,var(--success)_35%,transparent)] ring-2 ring-inset";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS =
  "relative overflow-hidden rounded-lg p-0 hover:opacity-95";

export const TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS =
  "ring-(--success) ring-2 ring-inset";

export function TemplateBuilderSelectableTileIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border",
        isSelected
          ? "border-[color-mix(in_oklab,var(--success)_40%,transparent)] bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-(--success)"
          : "border-border text-muted-foreground border-dashed",
      )}
      aria-hidden
    >
      {isSelected ? (
        <Check className="size-4" strokeWidth={2.5} />
      ) : (
        <Plus className="size-4" strokeWidth={2} />
      )}
    </span>
  );
}

export function TemplateBuilderSelectableTileCheckBadge() {
  return (
    <span
      className="text-background absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-(--success) shadow-sm"
      aria-hidden
    >
      <Check className="size-3" strokeWidth={2.5} />
    </span>
  );
}

export function TemplateBuilderSelectableTilePicker({
  label,
  groupAriaLabel,
  items,
  selectedId,
  isChanged,
  onSelect,
  emptyMessage = "No options available.",
  renderVisual,
  getTileBackgroundStyle,
  selectedTileClassName,
}: {
  label: string;
  groupAriaLabel: string;
  items: Array<{ id: number; title: string }>;
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  emptyMessage?: string;
  renderVisual?: (item: { id: number; title: string }, isSelected: boolean) => ReactNode;
  getTileBackgroundStyle?: (
    item: { id: number; title: string },
    isSelected: boolean,
  ) => CSSProperties | undefined;
  selectedTileClassName?: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const usesSplitBackground = getTileBackgroundStyle != null;
  const resolvedSelectedClassName =
    selectedTileClassName ??
    (usesSplitBackground
      ? TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS
      : TEMPLATE_BUILDER_SELECTABLE_TILE_SELECTED_CLASS);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {isChanged ? (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-500">Changed</span>
        ) : (
          <span className="text-muted-foreground text-xs">Unchanged</span>
        )}
      </div>

      <div role="group" aria-label={groupAriaLabel} className="min-w-0 overflow-x-auto py-1">
        <div className="flex w-max min-w-full flex-nowrap gap-2">
          {items.map((item) => {
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
                  TEMPLATE_BUILDER_SELECTABLE_TILE_CLASS,
                  isSplitTile && TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS,
                  isSplitTile && "bg-transparent text-white hover:bg-transparent",
                  isSelected && resolvedSelectedClassName,
                )}
              >
                {isSplitTile ? (
                  <>
                    {isSelected ? <TemplateBuilderSelectableTileCheckBadge /> : null}
                    <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/45 px-1.5 py-1">
                      <span className="line-clamp-2 text-xs leading-tight font-semibold">
                        {item.title}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="line-clamp-2 text-xs leading-tight font-semibold">
                      {item.title}
                    </span>
                    {renderVisual ? (
                      renderVisual(item, isSelected)
                    ) : (
                      <TemplateBuilderSelectableTileIcon isSelected={isSelected} />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
