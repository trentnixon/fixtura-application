"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toNumberOrNull } from "@/types/api/template-textures";

import { useTemplateTexturePickerList } from "./_hooks";
import { valueLabel } from "./_utils";

export function TemplateTexturePickerDetail() {
  const { selectedTexture } = useTemplateTexturePickerList();
  const coercedOpacity = selectedTexture ? toNumberOrNull(selectedTexture.opacity) : null;
  const t = selectedTexture?.texture;

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg">Selected texture detail</CardTitle>
        <CardDescription>
          Shared detail panel for the currently selected row. CMS may return{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">opacity</code> as a string or
          number; the coerced value uses{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">Number()</code> for debugging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {selectedTexture ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">id:</span> {selectedTexture.id}
              </p>
              <p>
                <span className="text-muted-foreground">name:</span>{" "}
                {selectedTexture.name ?? "null"}
              </p>
              <p>
                <span className="text-muted-foreground">opacity (raw):</span>{" "}
                {valueLabel(selectedTexture.opacity)}
              </p>
              <p>
                <span className="text-muted-foreground">opacity (coerced):</span>{" "}
                {coercedOpacity === null ? "null" : String(coercedOpacity)}
              </p>
              <p>
                <span className="text-muted-foreground">blendMode:</span>{" "}
                {valueLabel(selectedTexture.blendMode)}
              </p>
              <p>
                <span className="text-muted-foreground">texture.id:</span> {t ? t.id : "null"}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">texture.url:</span>{" "}
                <span className="font-mono text-xs break-all">{t?.url ?? "null"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">texture.width:</span>{" "}
                {t ? valueLabel(t.width) : "null"}
              </p>
              <p>
                <span className="text-muted-foreground">texture.height:</span>{" "}
                {t ? valueLabel(t.height) : "null"}
              </p>
              <p>
                <span className="text-muted-foreground">texture.mime:</span>{" "}
                {t ? valueLabel(t.mime) : "null"}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">texture.alternativeText:</span>{" "}
                {t?.alternativeText ?? "null"}
              </p>
            </div>
            <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
              {JSON.stringify(selectedTexture, null, 2)}
            </pre>
          </>
        ) : (
          <TypographyMuted>No selected template texture.</TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}
