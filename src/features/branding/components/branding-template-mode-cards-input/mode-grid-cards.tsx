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

const COMPACT_TILE_LAYOUT =
  "mx-0! size-20! max-w-20! min-w-20! gap-0.5 rounded-lg p-1.5 shadow-md ring-1";

const COMPACT_VISUAL_CLASS = "size-6! rounded-md";

export function ModeGridCards({
  modes,
  selectValue,
  setSelectedId,
  brandPrimaryHex,
  brandSecondaryHex,
  density = "default",
}: ModeGridCardsProps) {
  const compact = density === "compact";
  const gp = brandPrimaryHex ? tryNormalizeHex(brandPrimaryHex) : null;
  const gs = brandSecondaryHex ? tryNormalizeHex(brandSecondaryHex) : null;
  const gradientFill = gp !== null && gs !== null;
  const tileLayout = compact ? COMPACT_TILE_LAYOUT : CONTRAST_MODE_TILE_LAYOUT;

  return (
    <div
      role="group"
      aria-label="Contrast template modes"
      className={cn(
        compact
          ? "overflow-visible"
          : "max-h-[min(70vh,44rem)] overflow-x-hidden overflow-y-auto pt-1 pb-20 max-lg:max-h-none max-lg:overflow-visible",
      )}
    >
      <div
        className={cn(
          compact
            ? "flex flex-wrap justify-start gap-2"
            : "grid w-full grid-cols-2 gap-4 min-[1200px]:grid-cols-4 sm:gap-6",
        )}
      >
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
          const compactTitleClass = compact
            ? "!text-[10px] !leading-tight !font-semibold line-clamp-1"
            : undefined;
          const compactCtaClass = compact ? "!text-[9px] leading-none" : undefined;

          if (slugMissing) {
            return (
              <GridCard
                key={mode.id}
                title={title}
                {...(description ? { description } : {})}
                ctaLabel="Unavailable"
                disabled
                className={cn(tileLayout, flatTileSelectedClass(isSelected, contrastVariant))}
                {...(compactTitleClass !== undefined ? { titleClassName: compactTitleClass } : {})}
                {...(compactCtaClass !== undefined ? { ctaClassName: compactCtaClass } : {})}
                visual={
                  <div
                    className={cn(
                      "border-border flex shrink-0 items-center justify-center border border-dashed",
                      "bg-muted/30 text-muted-foreground text-xs font-medium",
                      compact ? cn(COMPACT_VISUAL_CLASS, "rounded-md") : "size-16 rounded-xl",
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
                ctaLabel={isSelected ? "Selected" : compact ? "Apply" : "Apply contrast"}
                onClick={() => setSelectedId(String(mode.id))}
                tileStyle={{
                  backgroundImage: `linear-gradient(135deg, ${gp} 0%, ${gs} 100%)`,
                }}
                className={cn(
                  tileLayout,
                  "bg-transparent! text-white shadow-xl ring-1 ring-black/15 hover:bg-transparent! dark:ring-white/20",
                  isSelected && "ring-offset-background ring-2 ring-white ring-offset-2",
                  compact && isSelected && "ring-offset-1",
                )}
                titleClassName={cn(
                  "!text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
                  darkTitles && "!text-zinc-950 !drop-shadow-[0_1px_1px_rgba(255,255,255,0.55)]",
                  compactTitleClass,
                )}
                ctaClassName={cn(
                  "!text-white/95 group-hover:!text-white underline-offset-4 group-hover:underline",
                  compactCtaClass,
                )}
                visual={
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className={cn(
                      "border-white/50 bg-black/20! text-white! backdrop-blur-[2px]",
                      darkTitles && "border-zinc-950/25 bg-white/30! text-zinc-950!",
                      compact && COMPACT_VISUAL_CLASS,
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
              ctaLabel={isSelected ? "Selected" : compact ? "Apply" : "Apply contrast"}
              onClick={() => setSelectedId(String(mode.id))}
              className={cn(
                tileLayout,
                flatTileSurfaceClass(contrastVariant),
                flatTileSelectedClass(isSelected, contrastVariant),
              )}
              titleClassName={cn(
                templateModeContrastTitleClass(contrastVariant, false),
                "!font-semibold",
                compactTitleClass,
              )}
              {...(compactCtaClass !== undefined ? { ctaClassName: compactCtaClass } : {})}
              visual={
                contrastVariant === "dark" ? (
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className={cn(
                      "border-white/40 bg-white/10! text-white!",
                      compact && COMPACT_VISUAL_CLASS,
                    )}
                  />
                ) : contrastVariant === "dark-alt" ? (
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className={cn(
                      "border-zinc-700 bg-zinc-900! text-zinc-300!",
                      compact && COMPACT_VISUAL_CLASS,
                    )}
                  />
                ) : (
                  <GridCardVisualSlot
                    visual="add"
                    emphasis="strong"
                    className={cn(compact && COMPACT_VISUAL_CLASS)}
                  />
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}
