"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateCategoryPickerList } from "./_hooks";
import { categoryLabel } from "./_utils";

export function TemplateCategoryCardPicker() {
  const { categories, selectValue, setSelectedId } = useTemplateCategoryPickerList();

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const isSelected = String(cat.id) === selectValue;
          const title = categoryLabel(cat);
          return (
            <Card
              key={cat.id}
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
              onClick={() => setSelectedId(String(cat.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(cat.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{title}</CardTitle>
                  <Badge variant={cat.isPrivate ? "secondary" : "outline"} className="shrink-0">
                    {cat.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">
                  id {cat.id}
                  {cat.slug ? ` · ${cat.slug}` : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
