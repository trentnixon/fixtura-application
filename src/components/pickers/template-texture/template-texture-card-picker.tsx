"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toNumberOrNull } from "@/types/api/template-textures";

import { useTemplateTexturePickerList } from "./_hooks";
import { templateTextureLabel, valueLabel } from "./_utils";

export function TemplateTextureCardPicker({ accountId }: { accountId: string }) {
  const { textures, selectValue, setSelectedId } = useTemplateTexturePickerList(accountId);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {textures.map((texture) => {
        const isSelected = String(texture.id) === selectValue;
        const coercedOpacity = toNumberOrNull(texture.opacity);
        const t = texture.texture;
        return (
          <button
            key={texture.id}
            type="button"
            onClick={() => setSelectedId(String(texture.id))}
            className="text-left"
            aria-pressed={isSelected}
          >
            <Card
              className={cn(
                "h-full cursor-pointer transition",
                isSelected
                  ? "ring-primary bg-primary/5 ring-2"
                  : "hover:ring-primary/50 hover:bg-muted/40",
              )}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">{templateTextureLabel(texture)}</CardTitle>
                <CardDescription>ID: {texture.id}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1 text-xs">
                <p>opacity (raw): {valueLabel(texture.opacity)}</p>
                <p>
                  opacity (coerced): {coercedOpacity === null ? "null" : String(coercedOpacity)}
                </p>
                <p>blendMode: {valueLabel(texture.blendMode)}</p>
                <p>
                  texture:{" "}
                  {t
                    ? `${valueLabel(t.mime)} · ${valueLabel(t.width)}×${valueLabel(t.height)}`
                    : "null"}
                </p>
                {t?.url != null && (t.url.startsWith("http://") || t.url.startsWith("https://")) ? (
                  <img
                    src={t.url}
                    alt={t.alternativeText ?? ""}
                    className="mt-2 max-h-24 w-full rounded-md object-cover"
                  />
                ) : null}
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
