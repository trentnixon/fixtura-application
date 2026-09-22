"use client";

import { resolvePreviewMediaUrl } from "@/features/remotion-asset-preview/utils/resolve-preview-media-url";

import type { TemplateLuminanceItem } from "@/types/api/all-template-options";

export function TemplateBuilderLuminanceCardPicker({
  items,
  selectedId,
  onSelect,
}: {
  items: TemplateLuminanceItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  if (items.length === 0)
    return <p className="text-muted-foreground text-sm">No Luminance plates are available yet.</p>;
  return (
    <div className="grid gap-3">
      <p className="text-muted-foreground text-sm">
        Choose a grayscale plate. The preview uses your selected colour palette.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Luminance plates">
        {items.map((item) => {
          const url = resolvePreviewMediaUrl(item.image?.url);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === selectedId}
              disabled={url === null}
              className="border-border hover:border-primary aria-pressed:border-primary aria-pressed:ring-primary overflow-hidden rounded-lg border p-2 text-left disabled:opacity-50 aria-pressed:ring-2"
              onClick={() => onSelect(item.id)}
            >
              {url !== null ? (
                <div
                  role="img"
                  aria-label={item.image?.alternativeText ?? item.name ?? "Grayscale plate"}
                  className="mb-2 aspect-video rounded bg-cover bg-center"
                  style={{ backgroundImage: "url(" + JSON.stringify(url) + ")" }}
                />
              ) : null}
              <span className="text-sm">{item.name ?? "Luminance plate"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
