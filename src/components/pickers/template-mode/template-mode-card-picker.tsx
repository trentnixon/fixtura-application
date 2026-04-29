"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import { useTemplateModePickerList } from "./_hooks";
import {
  templateModeContrastSurfaceClass,
  templateModeContrastTitleClass,
  templateModeContrastVariant,
  templateModeLabel,
  templateModeSlugMissing,
} from "./_utils";

export type TemplateModeCardPickerProps = {
  /** Normalised brand hex. When both resolve, cards use a primary→secondary diagonal gradient. */
  brandPrimaryHex?: string | null;
  brandSecondaryHex?: string | null;
};

export function TemplateModeCardPicker({
  brandPrimaryHex,
  brandSecondaryHex,
}: TemplateModeCardPickerProps = {}) {
  const { modes, selectValue, setSelectedId } = useTemplateModePickerList();

  const gp = brandPrimaryHex ? tryNormalizeHex(brandPrimaryHex) : null;
  const gs = brandSecondaryHex ? tryNormalizeHex(brandSecondaryHex) : null;
  const gradientFill = gp !== null && gs !== null;

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground px-6 text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => {
          const isSelected = String(mode.id) === selectValue;
          const title = templateModeLabel(mode);
          const contrastVariant = templateModeContrastVariant(mode.slug);
          const titleClass = templateModeContrastTitleClass(contrastVariant, gradientFill);

          return (
            <Card
              key={mode.id}
              role="button"
              tabIndex={0}
              aria-label={title}
              aria-pressed={isSelected}
              data-state={isSelected ? "selected" : undefined}
              className={cn(
                "cursor-pointer py-4 shadow-md ring-1 transition-[box-shadow,filter] outline-none",
                gradientFill
                  ? "relative overflow-hidden hover:brightness-[1.03]"
                  : cn(
                      contrastVariant !== "unknown" &&
                        templateModeContrastSurfaceClass(contrastVariant),
                      contrastVariant === "unknown" && "hover:bg-muted/40",
                    ),
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
                isSelected && "ring-primary ring-2",
              )}
              onClick={() => setSelectedId(String(mode.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(mode.id));
                }
              }}
            >
              {gradientFill ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${gp} 0%, ${gs} 100%)`,
                  }}
                />
              ) : null}
              <CardHeader className={cn("gap-2 px-4 py-0", gradientFill && "relative z-10")}>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className={cn("text-base leading-snug", titleClass)}>
                    {title}
                  </CardTitle>
                  {templateModeSlugMissing(mode) ? (
                    <Badge variant="destructive" className="text-xs">
                      No slug
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
