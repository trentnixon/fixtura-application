"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import type { AssetPreviewDisplayMode } from "../types";

/** Matches `tabber.pill.borderless.brand-accent` — see template-builder tabber + kitchen-sink tabber. */
const ASSET_PREVIEW_DISPLAY_MODE_TOGGLE_LIST_CLASS =
  "flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none";

const ASSET_PREVIEW_DISPLAY_MODE_TOGGLE_ITEM_CLASS =
  "h-auto min-h-0 w-auto min-w-0 cursor-pointer rounded-full border border-[var(--brand-accent)]/40 bg-brand-accent/10 px-4 py-1.5 text-xs text-muted-foreground shadow-none hover:cursor-pointer hover:bg-brand-accent/15 sm:px-6 sm:py-2 sm:text-sm data-[state=on]:border-[var(--brand-accent)] data-[state=on]:bg-[var(--brand-accent)] data-[state=on]:text-white data-[state=on]:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-accent/10";

export type AssetPreviewDisplayModeToggleProps = {
  value: AssetPreviewDisplayMode;
  onValueChange: (value: AssetPreviewDisplayMode) => void;
  className?: string;
  disabled?: boolean;
};

export function AssetPreviewDisplayModeToggle({
  value,
  onValueChange,
  className,
  disabled = false,
}: AssetPreviewDisplayModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      spacing={2}
      value={value}
      disabled={disabled}
      aria-label="Preview display mode"
      className={cn(ASSET_PREVIEW_DISPLAY_MODE_TOGGLE_LIST_CLASS, "shrink-0", className)}
      onValueChange={(next) => {
        if (next === "thumbnails" || next === "video") {
          onValueChange(next);
        }
      }}
    >
      <ToggleGroupItem
        value="thumbnails"
        aria-label="Show thumbnail stills"
        className={ASSET_PREVIEW_DISPLAY_MODE_TOGGLE_ITEM_CLASS}
      >
        Thumbnails
      </ToggleGroupItem>
      <ToggleGroupItem
        value="video"
        aria-label="Show video preview"
        className={ASSET_PREVIEW_DISPLAY_MODE_TOGGLE_ITEM_CLASS}
      >
        Video
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
