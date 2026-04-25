"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplatePalettePickerList } from "./_hooks";
import { templatePaletteLabel } from "./_utils";

export function TemplatePaletteCardPicker() {
  const { palettes, selectValue, setSelectedId } = useTemplatePalettePickerList();

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {palettes.map((palette) => {
          const isSelected = String(palette.id) === selectValue;
          const title = templatePaletteLabel(palette);
          const colour = palette.ui?.value?.trim() || "";
          return (
            <Card
              key={palette.id}
              role="button"
              tabIndex={0}
              aria-label={title}
              aria-pressed={isSelected}
              data-state={isSelected ? "selected" : undefined}
              className={cn(
                "cursor-pointer py-4 shadow-md ring-1 transition-shadow outline-none",
                "hover:bg-muted/40 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
                isSelected && "ring-primary ring-2",
              )}
              onClick={() => setSelectedId(String(palette.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(palette.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{title}</CardTitle>
                  <div
                    className="border-border h-8 w-12 shrink-0 rounded border shadow-inner"
                    style={
                      colour ? { backgroundColor: colour } : { backgroundColor: "transparent" }
                    }
                    aria-hidden
                  />
                </div>
                <CardDescription className="font-mono text-xs">id {palette.id}</CardDescription>
                <CardDescription className="font-mono text-xs">
                  ui.value: {colour || "—"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
