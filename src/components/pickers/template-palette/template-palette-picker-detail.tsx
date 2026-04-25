"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplatePalettePickerList } from "./_hooks";

export function TemplatePalettePickerDetail() {
  const { selectedPalette } = useTemplatePalettePickerList();

  if (!selectedPalette) {
    return null;
  }

  const selected = selectedPalette;
  const colour = selected.ui?.value?.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selection detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <TypographyMuted className="text-xs leading-relaxed">
          <span className="font-mono">ui.value</span> is the CSS-ready colour value from the CMS —
          safe to pass to colour CSS properties. <span className="font-mono">name</span> is for
          display only.
        </TypographyMuted>
        <div
          className="border-border h-16 w-full max-w-md rounded-md border shadow-inner"
          style={colour ? { backgroundColor: colour } : undefined}
          aria-label="Colour preview from ui.value"
        />
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">id</dt>
          <dd>{selected.id}</dd>
          <dt className="text-muted-foreground">name (display)</dt>
          <dd>{selected.name?.trim() ? selected.name : "—"}</dd>
          <dt className="text-muted-foreground">ui.value (CSS-ready)</dt>
          <dd className="font-mono">{colour || "—"}</dd>
        </dl>
        <div className="pt-2">
          <p className="text-muted-foreground mb-1 text-xs">Raw JSON</p>
          <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
