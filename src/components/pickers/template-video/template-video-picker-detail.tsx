"use client";

import { TypographyMuted } from "@/components/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toNumberOrNull } from "@/types/api/template-videos";

import { useTemplateVideoPickerList } from "./_hooks";
import { valueLabel } from "./_utils";

export function TemplateVideoPickerDetail() {
  const { selectedVideo } = useTemplateVideoPickerList();
  const ui = selectedVideo?.ui;
  const coercedVolume = ui ? toNumberOrNull(ui.volume) : null;
  const coercedRate = ui ? toNumberOrNull(ui.playbackRate) : null;

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg">Selected video detail</CardTitle>
        <CardDescription>
          This catalog entry is configuration only (playback behaviour, layout, overlay JSON). There
          is no video file or URL in this API contract. CMS may return{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">volume</code> and{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">playbackRate</code> as strings
          or numbers; coerced values use{" "}
          <code className="bg-muted rounded px-1 font-mono text-xs">Number()</code> for debugging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {selectedVideo && ui ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">id:</span> {selectedVideo.id}
              </p>
              <p>
                <span className="text-muted-foreground">name:</span> {selectedVideo.name ?? "null"}
              </p>
              <p>
                <span className="text-muted-foreground">ui.position:</span>{" "}
                {valueLabel(ui.position)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.size:</span> {valueLabel(ui.size)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.loop:</span> {valueLabel(ui.loop)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.muted:</span> {valueLabel(ui.muted)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.useOffthreadVideo:</span>{" "}
                {valueLabel(ui.useOffthreadVideo)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.volume (raw):</span>{" "}
                {valueLabel(ui.volume)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.volume (coerced):</span>{" "}
                {coercedVolume === null ? "null" : String(coercedVolume)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.playbackRate (raw):</span>{" "}
                {valueLabel(ui.playbackRate)}
              </p>
              <p>
                <span className="text-muted-foreground">ui.playbackRate (coerced):</span>{" "}
                {coercedRate === null ? "null" : String(coercedRate)}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">ui.overlay:</span>
              </p>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs sm:col-span-2">
                {JSON.stringify(ui.overlay ?? {}, null, 2)}
              </pre>
            </div>
            <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
              {JSON.stringify(selectedVideo, null, 2)}
            </pre>
          </>
        ) : (
          <TypographyMuted>No selected template video.</TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}
