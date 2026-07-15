"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toNumberOrNull } from "@/types/api/template-videos";

import { useTemplateVideoPickerList } from "./_hooks";
import { templateVideoLabel, valueLabel } from "./_utils";

export function TemplateVideoCardPicker({ accountId }: { accountId: string }) {
  const { videos, selectValue, setSelectedId } = useTemplateVideoPickerList(accountId);

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs">
        Click a card or focus it and press Enter or Space. Configuration only — no media URL on this
        contract.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const isSelected = String(video.id) === selectValue;
          const title = templateVideoLabel(video);
          const ui = video.ui;
          const overlayKeys = Object.keys(ui.overlay ?? {}).length;
          const coercedVolume = toNumberOrNull(ui.volume);
          const coercedRate = toNumberOrNull(ui.playbackRate);
          return (
            <Card
              key={video.id}
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
              onClick={() => setSelectedId(String(video.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(String(video.id));
                }
              }}
            >
              <CardHeader className="gap-2 px-4 py-0">
                <CardTitle className="text-base leading-snug">{title}</CardTitle>
                <CardDescription className="font-mono text-xs">id {video.id}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1 px-4 pb-0 text-xs">
                <p>position: {valueLabel(ui.position)}</p>
                <p>size: {valueLabel(ui.size)}</p>
                <p>loop: {valueLabel(ui.loop)}</p>
                <p>muted: {valueLabel(ui.muted)}</p>
                <p>useOffthreadVideo: {valueLabel(ui.useOffthreadVideo)}</p>
                <p>volume (raw): {valueLabel(ui.volume)}</p>
                <p>volume (coerced): {coercedVolume === null ? "null" : String(coercedVolume)}</p>
                <p>playbackRate (raw): {valueLabel(ui.playbackRate)}</p>
                <p>playbackRate (coerced): {coercedRate === null ? "null" : String(coercedRate)}</p>
                {overlayKeys > 0 ? (
                  <p className="text-muted-foreground/90">overlay: {overlayKeys} keys</p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
