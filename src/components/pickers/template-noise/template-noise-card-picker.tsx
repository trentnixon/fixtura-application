"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateNoisePickerList } from "./_hooks";
import { templateNoiseLabel, templateNoiseTypeMissing } from "./_utils";

export function TemplateNoiseCardPicker({ accountId }: { accountId: string }) {
  const { noises, selectValue, setSelectedId } = useTemplateNoisePickerList(accountId);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {noises.map((noise) => {
          const isSelected = String(noise.id) === selectValue;
          const title = templateNoiseLabel(noise);
          return (
            <Card
              key={noise.id}
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
              onClick={() => setSelectedId(String(noise.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(noise.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base leading-snug">{title}</CardTitle>
                  {templateNoiseTypeMissing(noise) ? (
                    <Badge variant="destructive" className="text-xs">
                      No ui.type
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="font-mono text-xs">id {noise.id}</CardDescription>
                <CardDescription className="font-mono text-xs">
                  ui.type: {noise.ui?.type?.trim() || "—"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
