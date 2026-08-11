"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTemplateImagePickerList } from "./_hooks";

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

export function TemplateImagePickerDetail({ accountId }: { accountId: string }) {
  const { selectedImage } = useTemplateImagePickerList(accountId);

  if (!selectedImage) {
    return null;
  }

  const selected = selectedImage;

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
          <dd>{fmt(selected.ui?.type)}</dd>
          <dt className="text-muted-foreground">ui.direction</dt>
          <dd>{fmt(selected.ui?.direction)}</dd>
          <dt className="text-muted-foreground">ui.overlayStyle</dt>
          <dd>{fmt(selected.ui?.overlayStyle)}</dd>
          <dt className="text-muted-foreground">ui.gradientType</dt>
          <dd>{fmt(selected.ui?.gradientType)}</dd>
          <dt className="text-muted-foreground">ui.overlayOpacity</dt>
          <dd>{fmt(selected.ui?.overlayOpacity)}</dd>
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
