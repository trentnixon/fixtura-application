"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTemplateImagePickerList } from "./_hooks";
import { templateImageLabel } from "./_utils";

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

export function TemplateImageCardPicker({ accountId }: { accountId: string }) {
  const { images, selectValue, setSelectedId } = useTemplateImagePickerList(accountId);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => {
          const isSelected = String(img.id) === selectValue;
          const title = templateImageLabel(img);
          return (
            <Card
              key={img.id}
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
              onClick={() => setSelectedId(String(img.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(img.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <CardTitle className="text-base leading-snug">{title}</CardTitle>
                <CardDescription className="font-mono text-xs">id {img.id}</CardDescription>
                <CardDescription className="text-xs">
                  {fmt(img.ui?.type)} · {fmt(img.ui?.direction)}
                </CardDescription>
                <CardDescription className="text-xs">
                  {fmt(img.ui?.overlayStyle)} · {fmt(img.ui?.gradientType)} · opacity{" "}
                  {fmt(img.ui?.overlayOpacity)}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
