"use client";

import { useMemo } from "react";

import {
  templateModeLabel,
  templateModeSlugMissing,
  templateModeUsesDarkTitlesOnGradient,
} from "@/components/pickers/template-mode/_utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tryNormalizeHex } from "@/lib/brand-color";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";
import { cn } from "@/lib/utils";

import {
  TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS,
  TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS,
  TEMPLATE_BUILDER_SELECTABLE_TILE_VERTICAL_CLASS,
  TemplateBuilderSelectableTileIcon,
} from "./template-builder-selectable-tile-picker";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateModeItem } from "@/types/api/all-template-options";

export function TemplateBuilderContrastModePicker({
  branding,
  modes,
  selectedId,
  isChanged,
  onSelect,
  centerTiles = false,
}: {
  branding: AccountBrandingData | null;
  modes: TemplateModeItem[];
  selectedId: number | null;
  isChanged: boolean;
  onSelect: (id: number) => void;
  centerTiles?: boolean;
}) {
  const brandColors = useMemo(
    () => themeColoursFromAccountBrandingTheme(branding?.theme ?? null),
    [branding?.theme],
  );

  const gradientFill = useMemo(() => {
    const primary = tryNormalizeHex(brandColors.primary);
    const secondary = tryNormalizeHex(brandColors.secondary);
    if (primary === null || secondary === null) return null;
    return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  }, [brandColors.primary, brandColors.secondary]);

  if (modes.length === 0) {
    return (
      <div className={cn("grid gap-3", centerTiles && "w-full")}>
        <p className="text-muted-foreground text-sm">No contrast modes available.</p>
      </div>
    );
  }

  return (
    <div className={cn("grid w-full gap-3")}>
      {isChanged ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs" aria-label="Contrast changed">
            Changed
          </span>
        </div>
      ) : null}

      <ScrollArea className="h-[min(55vh,26rem)] w-full pr-2" aria-label="Contrast">
        <div role="group" aria-label="Contrast" className="grid grid-cols-2 gap-1.5 pb-1">
          {modes.map((mode) => {
            const isSelected = mode.id === selectedId;
            const title = templateModeLabel(mode);
            const slugMissing = templateModeSlugMissing(mode);
            const darkTitles = templateModeUsesDarkTitlesOnGradient(mode.slug);

            return (
              <button
                key={mode.id}
                type="button"
                disabled={slugMissing}
                aria-label={`${title}. ${isSelected ? "Selected" : slugMissing ? "Unavailable" : "Apply contrast"}`}
                aria-pressed={isSelected}
                onClick={() => {
                  if (slugMissing) return;
                  onSelect(mode.id);
                }}
                style={gradientFill ? { backgroundImage: gradientFill } : undefined}
                className={cn(
                  TEMPLATE_BUILDER_SELECTABLE_TILE_VERTICAL_CLASS,
                  TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_CLASS,
                  gradientFill ? "bg-transparent text-white hover:bg-transparent" : "bg-muted/40",
                  isSelected && TEMPLATE_BUILDER_SELECTABLE_TILE_SPLIT_SELECTED_CLASS,
                  slugMissing && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="relative z-10 flex h-full flex-col items-center justify-center gap-1.5 p-2">
                  <span
                    className={cn(
                      "line-clamp-2 text-[0.65rem] leading-tight font-semibold",
                      gradientFill
                        ? darkTitles
                          ? "text-zinc-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.55)]"
                          : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                        : "text-foreground",
                    )}
                  >
                    {title}
                  </span>
                  <TemplateBuilderSelectableTileIcon
                    isSelected={isSelected}
                    onColorfulBackground={gradientFill != null}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
