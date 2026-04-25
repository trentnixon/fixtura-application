"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateModePickerList } from "./_hooks";
import { templateModeLabel, templateModeSlugMissing } from "./_utils";

export function TemplateModeCardPicker() {
  const { modes, selectValue, setSelectedId } = useTemplateModePickerList();

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => {
          const isSelected = String(mode.id) === selectValue;
          const title = templateModeLabel(mode);
          return (
            <Card
              key={mode.id}
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
              onClick={() => setSelectedId(String(mode.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(mode.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base leading-snug">{title}</CardTitle>
                  {templateModeSlugMissing(mode) ? (
                    <Badge variant="destructive" className="text-xs">
                      No slug
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="font-mono text-xs">id {mode.id}</CardDescription>
                <CardDescription className="text-xs">
                  slug: {mode.slug?.trim() || "—"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
