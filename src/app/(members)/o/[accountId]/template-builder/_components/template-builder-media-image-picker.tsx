"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TemplateBuilderMediaPreviewState } from "../_utils/template-builder-media-preview";

function mediaItemLabel(title: string, id: number): string {
  return title.trim() || `Image ${id}`;
}

function MediaImageSelectOption({ imageUrl, label }: { imageUrl: string; label: string }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2.5">
      <span className="border-border/60 bg-muted flex h-8 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border">
        <img src={imageUrl} alt="" className="size-full object-cover" loading="lazy" />
      </span>
      <span className="truncate font-medium">{label}</span>
    </span>
  );
}

export function TemplateBuilderMediaImagePicker({
  mediaPreview,
}: {
  mediaPreview: TemplateBuilderMediaPreviewState;
}) {
  const selectedValue =
    mediaPreview.selectedId === null ? undefined : String(mediaPreview.selectedId);

  return (
    <div className="border-border/60 grid gap-2 border-b pb-4">
      <Label htmlFor="template-builder-preview-media-image" className="text-sm font-medium">
        Preview image
      </Label>

      <Select
        value={selectedValue ?? ""}
        onValueChange={(value) => mediaPreview.onSelectedIdChange(Number(value))}
        disabled={mediaPreview.status !== "ready" || mediaPreview.items.length === 0}
      >
        <SelectTrigger
          id="template-builder-preview-media-image"
          className="h-auto min-h-11 w-full py-1.5"
        >
          <SelectValue placeholder="Choose a preview image…" />
        </SelectTrigger>
        <SelectContent>
          {mediaPreview.items.map((item) => (
            <SelectItem
              key={item.id}
              value={String(item.id)}
              textValue={mediaItemLabel(item.title, item.id)}
              className="py-2"
            >
              <MediaImageSelectOption
                imageUrl={item.image.url}
                label={mediaItemLabel(item.title, item.id)}
              />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mediaPreview.status === "loading" ? (
        <p className="text-muted-foreground text-xs" role="status">
          Loading images…
        </p>
      ) : null}

      {mediaPreview.status === "error" ? (
        <div className="flex flex-wrap items-center justify-between gap-2" role="alert">
          <p className="text-destructive text-xs">
            {mediaPreview.errorMessage ?? "Could not load images."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={mediaPreview.onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
