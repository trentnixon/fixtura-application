"use client";

import {
  templateModeContrastTitleClass,
  templateModeContrastVariant,
  templateModeLabel,
  templateModeSlugMissing,
  templateModeUsesDarkTitlesOnGradient,
} from "@/components/pickers/template-mode/_utils";
import { GridCard, GridCardVisualSlot } from "@/components/ui/grid-card";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import { CONTRAST_MODE_TILE_LAYOUT } from "./_consts";
import { flatTileSelectedClass, flatTileSurfaceClass } from "./_utils";

import type { ModeGridCardsProps } from "./_types";

export function ModeGridCards({
  modes,
  selectValue,
  setSelectedId,
  brandPrimaryHex,
  brandSecondaryHex,
}: ModeGridCardsProps) {
  const gp = brandPrimaryHex ? tryNormalizeHex(brandPrimaryHex) : null;
  const gs = brandSecondaryHex ? tryNormalizeHex(brandSecondaryHex) : null;
  const gradientFill = gp !== null && gs !== null;

  return (
    <div
      role="group"
      aria-label="Contrast template modes"
      className="max-h-[min(70vh,44rem)] overflow-x-hidden overflow-y-auto pt-1 pb-20 max-lg:max-h-none max-lg:overflow-visible"
    >
      <div className="grid w-full grid-cols-2 gap-4 min-[1200px]:grid-cols-4 sm:gap-6">
        {modes.map((mode) => {
          const isSelected = String(mode.id) === selectValue;
          const title = templateModeLabel(mode);
          const slugMissing = templateModeSlugMissing(mode);
          const contrastVariant = templateModeContrastVariant(mode.slug);
          const slugLine = mode.slug?.trim() || null;
          const description = slugMissing
            ? "No slug on this mode — cannot apply"
            : slugLine
              ? `Slug: ${slugLine}`
              : undefined;

          if (slugMissing) {
            return (
              <GridCard
                key={mode.id}
                title={title}
                {...(description ? { description } : {})}
                ctaLabel="Unavailable"
                disabled
                className={cn(
                  CONTRAST_MODE_TILE_LAYOUT,
                  flatTileSelectedClass(isSelected, contrastVariant),
                )}
                visual={
                  <div
                    className={cn(
                      "border-border flex size-16 shrink-0 items-center justify-center rounded-xl border border-dashed",
                      "bg-muted/30 text-muted-foreground text-xs font-medium",
                    )}
                    aria-hidden
                  >
                    —
                  </div>
                }
              />
            );
          }

          if (gradientFill) {
            const darkTitles = templateModeUsesDarkTitlesOnGradient(mode.slug);
            return (
              <GridCard
                key={mode.id}
                title={title}
                {...(description ? { description } : {})}
                ctaLabel={isSelected ? "Selected" : "Apply contrast"}
                onClick={() => setSelectedId(String(mode.id))}
                tileStyle={{
                  backgroundImage: `linear-gradient(135deg, ${gp} 0%, ${gs} 100%)`,
                }}
                className={cn(
                  CONTRAST_MODE_TILE_LAYOUT,
                  "bg-transparent! text-white shadow-xl ring-1 ring-black/15 hover:bg-transparent! dark:ring-white/20",
                  isSelected && "ring-offset-background ring-2 ring-white ring-offset-2",
                )}
                titleClassName={cn(
                  "!text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                  darkTitles && "!text-zinc-950 !drop-shadow-[0_1px_1px_rgba(255,255,255,0.55)]",
                )}
                ctaClassName="!text-white/95 group-hover:!text-white underline-offset-4 group-hover:underline"
                visual={
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className={cn(
                      "border-white/50 bg-black/20! text-white! backdrop-blur-[2px]",
                      darkTitles && "border-zinc-950/25 bg-white/30! text-zinc-950!",
                    )}
                  />
                }
              />
            );
          }

          return (
            <GridCard
              key={mode.id}
              title={title}
              {...(description ? { description } : {})}
              ctaLabel={isSelected ? "Selected" : "Apply contrast"}
              onClick={() => setSelectedId(String(mode.id))}
              className={cn(
                CONTRAST_MODE_TILE_LAYOUT,
                flatTileSurfaceClass(contrastVariant),
                flatTileSelectedClass(isSelected, contrastVariant),
              )}
              titleClassName={cn(
                templateModeContrastTitleClass(contrastVariant, false),
                "!font-semibold",
              )}
              visual={
                contrastVariant === "dark" || contrastVariant === "dark-alt" ? (
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className="border-white/40 bg-white/10! text-white!"
                  />
                ) : (
                  <GridCardVisualSlot visual="add" emphasis="strong" />
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}
