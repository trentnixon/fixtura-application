"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplateNoisePickerList } from "./_hooks";

export function TemplateNoisePickerDetail() {
  const { selectedNoise } = useTemplateNoisePickerList();

  if (!selectedNoise) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selection detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <TypographyMuted className="text-xs leading-relaxed">
          <span className="font-mono">ui.type</span> is the app-facing canonical noise identifier —
          use it when saving or comparing to scheduler/account payloads.{" "}
          <span className="font-mono">name</span> is for display only.
        </TypographyMuted>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">id</dt>
          <dd>{selectedNoise.id}</dd>
          <dt className="text-muted-foreground">name (display)</dt>
          <dd>{selectedNoise.name ?? "—"}</dd>
          <dt className="text-muted-foreground">ui.type (canonical)</dt>
          <dd className="font-mono">{selectedNoise.ui?.type ?? "—"}</dd>
        </dl>
        <div className="pt-2">
          <p className="text-muted-foreground mb-1 text-xs">Raw JSON</p>
          <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
            {JSON.stringify(selectedNoise, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
