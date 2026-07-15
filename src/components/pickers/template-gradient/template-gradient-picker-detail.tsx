"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplateGradientPickerList } from "./_hooks";

export function TemplateGradientPickerDetail({ accountId }: { accountId: string }) {
  const { selectedGradient } = useTemplateGradientPickerList(accountId);

  if (!selectedGradient) {
    return null;
  }

  const selected = selectedGradient;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selection detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">id</dt>
          <dd>{selected.id}</dd>
          <dt className="text-muted-foreground">name</dt>
          <dd>{selected.name ?? "—"}</dd>
          <dt className="text-muted-foreground">ui.type</dt>
          <dd>{selected.ui?.type ?? "—"}</dd>
          <dt className="text-muted-foreground">ui.direction</dt>
          <dd>{selected.ui?.direction ?? "—"}</dd>
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
