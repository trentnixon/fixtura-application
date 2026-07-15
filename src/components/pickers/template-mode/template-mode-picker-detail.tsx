"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplateModePickerList } from "./_hooks";

export function TemplateModePickerDetail({ accountId }: { accountId: string }) {
  const { selectedMode } = useTemplateModePickerList(accountId);

  if (!selectedMode) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selection detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <TypographyMuted className="text-xs leading-relaxed">
          <span className="font-mono">slug</span> is the canonical app value — use it when saving or
          comparing mode. <span className="font-mono">name</span> is for display only.
        </TypographyMuted>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">id</dt>
          <dd>{selectedMode.id}</dd>
          <dt className="text-muted-foreground">name (display)</dt>
          <dd>{selectedMode.name ?? "—"}</dd>
          <dt className="text-muted-foreground">slug (persisted value)</dt>
          <dd className="font-mono">{selectedMode.slug ?? "—"}</dd>
        </dl>
        <div className="pt-2">
          <p className="text-muted-foreground mb-1 text-xs">Raw JSON</p>
          <pre className="bg-muted max-h-40 overflow-auto rounded-md p-2 text-xs">
            {JSON.stringify(selectedMode, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
