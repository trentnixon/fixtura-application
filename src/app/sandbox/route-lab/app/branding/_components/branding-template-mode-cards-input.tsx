"use client";

import { useTemplateModePickerList } from "@/components/pickers/template-mode";
import {
  templateModeContrastRowDividerClass,
  templateModeContrastSelectedLabelClass,
  templateModeContrastSurfaceClass,
  templateModeContrastTitleClass,
  templateModeContrastVariant,
  templateModeLabel,
  templateModeSlugMissing,
} from "@/components/pickers/template-mode/_utils";
import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { SectionBlock } from "@/components/ui/section";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import type { TemplateModeUiItem } from "@/types/api/template-modes";

export type BrandingTemplateModeCardsInputProps = {
  interactive: boolean;
  /** Brand hex strings from colour fields; rows use a primary→secondary gradient when both normalise. */
  brandPrimaryHex?: string | null;
  brandSecondaryHex?: string | null;
};

function ModeInsetList({
  modes,
  selectValue,
  setSelectedId,
  brandPrimaryHex,
  brandSecondaryHex,
}: {
  modes: TemplateModeUiItem[];
  selectValue: string;
  setSelectedId: (id: string | null | undefined) => void;
  brandPrimaryHex?: string | null | undefined;
  brandSecondaryHex?: string | null | undefined;
}) {
  const gp = brandPrimaryHex ? tryNormalizeHex(brandPrimaryHex) : null;
  const gs = brandSecondaryHex ? tryNormalizeHex(brandSecondaryHex) : null;
  const gradientFill = gp !== null && gs !== null;

  return (
    <SectionBlock variant="inset" spacing="md">
      <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
        Contrast selector
      </TypographyMuted>
      <TypographyMuted className="text-sm leading-relaxed">
        Choose the contrast preset that works best for your rendered assets — each pairs title
        colour with container background: <span className="text-foreground/90">Light</span> (white
        titles, white containers), <span className="text-foreground/90">Light Alt</span> (black
        titles, white containers), <span className="text-foreground/90">Dark</span> (black titles,
        black containers), <span className="text-foreground/90">Dark Alt</span> (white titles, black
        containers). Saved as <span className="font-mono">slug</span>.
      </TypographyMuted>

      <div className="border-border/70 flex flex-col overflow-hidden rounded-lg border">
        {modes.map((mode) => {
          const isSelected = String(mode.id) === selectValue;
          const title = templateModeLabel(mode);
          const slugMissing = templateModeSlugMissing(mode);
          const contrastVariant = templateModeContrastVariant(mode.slug);
          const titleClass = templateModeContrastTitleClass(contrastVariant, gradientFill);
          const selectedLabelClass = templateModeContrastSelectedLabelClass(
            contrastVariant,
            gradientFill,
          );

          return (
            <button
              key={mode.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={cn(
                "relative flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-[filter] outline-none",
                templateModeContrastRowDividerClass(contrastVariant),
                "border-b last:border-b-0",
                !gradientFill &&
                  contrastVariant === "unknown" &&
                  "hover:bg-muted/35 focus-visible:ring-ring focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-offset-2",
                !gradientFill &&
                  (contrastVariant === "light" || contrastVariant === "light-alt") &&
                  "focus-visible:ring-ring hover:bg-zinc-100/90 focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-offset-2",
                !gradientFill &&
                  (contrastVariant === "dark" || contrastVariant === "dark-alt") &&
                  "focus-visible:ring-ring hover:brightness-110 focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-offset-2",
                !gradientFill &&
                  contrastVariant !== "unknown" &&
                  templateModeContrastSurfaceClass(contrastVariant),
                gradientFill &&
                  "focus-visible:ring-ring hover:brightness-[1.03] focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-offset-2",
                !gradientFill &&
                  isSelected &&
                  (contrastVariant === "dark" || contrastVariant === "dark-alt") &&
                  "ring-2 ring-white/45 ring-inset",
                !gradientFill &&
                  isSelected &&
                  (contrastVariant === "light" || contrastVariant === "light-alt") &&
                  "ring-primary ring-2 ring-inset",
                !gradientFill &&
                  isSelected &&
                  contrastVariant === "unknown" &&
                  "bg-muted/50 ring-primary ring-2 ring-inset",
                gradientFill && isSelected && "ring-2 ring-white/70 ring-inset",
              )}
              onClick={() => setSelectedId(String(mode.id))}
            >
              {gradientFill ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-95"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${gp} 0%, ${gs} 100%)`,
                  }}
                />
              ) : null}
              <span className={cn("relative z-1", titleClass)}>{title}</span>
              <span className="relative z-1 flex shrink-0 items-center gap-2">
                {slugMissing ? (
                  <Badge variant="destructive" className="text-xs">
                    No slug
                  </Badge>
                ) : null}
                {isSelected ? <span className={selectedLabelClass}>Selected</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </SectionBlock>
  );
}

/**
 * Template mode: contrast preset for asset titles vs container backgrounds (GET
 * `/api/template-modes/ui` via `useTemplateModePickerList`).
 */
export function BrandingTemplateModeCardsInput({
  interactive,
  brandPrimaryHex,
  brandSecondaryHex,
}: BrandingTemplateModeCardsInputProps) {
  const { modes, selectValue, setSelectedId, isPending, isError, error } =
    useTemplateModePickerList();

  if (!interactive) {
    return (
      <SectionBlock variant="inset" spacing="sm">
        <TypographyMuted className="text-xs">
          Switch route lab to edit mode to choose a template mode.
        </TypographyMuted>
      </SectionBlock>
    );
  }

  if (isPending) {
    return (
      <SectionBlock variant="inset" spacing="sm">
        <p className="text-muted-foreground text-sm" role="status">
          Loading template modes…
        </p>
      </SectionBlock>
    );
  }

  if (isError) {
    return (
      <SectionBlock variant="inset" spacing="sm">
        <TypographyMuted className="text-destructive text-sm">
          {error instanceof Error ? error.message : "Could not load template modes"}
        </TypographyMuted>
      </SectionBlock>
    );
  }

  if (modes.length === 0) {
    return (
      <SectionBlock variant="inset" spacing="sm">
        <TypographyMuted className="text-sm">No template modes available.</TypographyMuted>
      </SectionBlock>
    );
  }

  return (
    <ModeInsetList
      modes={modes}
      selectValue={selectValue}
      setSelectedId={setSelectedId}
      brandPrimaryHex={brandPrimaryHex}
      brandSecondaryHex={brandSecondaryHex}
    />
  );
}
