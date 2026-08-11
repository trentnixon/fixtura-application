"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateGradientPickerList } from "./_hooks";
import { gradientLabel } from "./_utils";

export function TemplateGradientCardPicker({ accountId }: { accountId: string }) {
  const { gradients, selectValue, setSelectedId } = useTemplateGradientPickerList(accountId);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gradients.map((g) => {
          const isSelected = String(g.id) === selectValue;
          const title = gradientLabel(g);
          return (
            <Card
              key={g.id}
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
              onClick={() => setSelectedId(String(g.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(g.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <CardTitle className="text-base leading-snug">{title}</CardTitle>
                <CardDescription className="font-mono text-xs">id {g.id}</CardDescription>
                <CardDescription className="text-xs">
                  {g.ui?.type ?? "—"} · {g.ui?.direction ?? "—"}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
