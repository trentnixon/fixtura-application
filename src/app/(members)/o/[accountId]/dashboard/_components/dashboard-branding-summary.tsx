import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { SectionBlock, SectionLabel } from "@/components/ui/section";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import type { DashboardViewModel } from "../dashboard-view-model";

const SWATCH_KEYS = ["primary", "secondary", "dark", "white"] as const;

type DashboardBrandingSummaryProps = {
  model: Pick<DashboardViewModel, "branding" | "logoUrl">;
  isPending: boolean;
};

export function DashboardBrandingSummary({ model, isPending }: DashboardBrandingSummaryProps) {
  if (isPending) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  const { branding, logoUrl } = model;
  const template = branding?.template;
  const theme = branding?.theme;
  const posterUrl = template?.poster?.url;
  const previewUrl = posterUrl || logoUrl;

  const themeRecord =
    theme?.theme && typeof theme.theme === "object" && !Array.isArray(theme.theme)
      ? (theme.theme as Record<string, unknown>)
      : null;

  const swatches: { key: (typeof SWATCH_KEYS)[number]; hex: string }[] = [];
  for (const key of SWATCH_KEYS) {
    const raw = themeRecord?.[key];
    if (typeof raw === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
      swatches.push({ key, hex: raw });
    }
  }

  const galleryCount = template?.gallery?.length ?? 0;
  const mediaSummary = [
    template?.poster ? "poster" : null,
    template?.video ? "video" : null,
    galleryCount > 0 ? `gallery (${galleryCount})` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <SectionBlock variant="surface" spacing="md">
      <div className="space-y-1">
        <SectionLabel>Branding</SectionLabel>
        <TypographyMuted className="text-xs">Template, theme, and preview</TypographyMuted>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="bg-muted/30 relative aspect-video w-full max-w-md overflow-hidden rounded-lg border lg:w-72">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No preview
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <TypographyMuted className="text-[10px] font-semibold uppercase">
              Template
            </TypographyMuted>
            <p className="text-sm font-medium">{template?.name ?? "—"}</p>
            {template?.frontEndName ? (
              <TypographyMuted className="text-xs">{template.frontEndName}</TypographyMuted>
            ) : null}
            {template?.category ? (
              <TypographyMuted className="text-xs">Category: {template.category}</TypographyMuted>
            ) : null}
          </div>
          <Separator />
          <div>
            <TypographyMuted className="text-[10px] font-semibold uppercase">Theme</TypographyMuted>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{theme?.name ?? "—"}</span>
              {theme?.isPublic != null ? (
                <Badge variant={theme.isPublic ? "secondary" : "outline"}>
                  {theme.isPublic ? "Catalogue" : "Custom"}
                </Badge>
              ) : null}
            </div>
          </div>
          {swatches.length > 0 ? (
            <>
              <Separator />
              <div>
                <TypographyMuted className="text-[10px] font-semibold uppercase">
                  Colours
                </TypographyMuted>
                <div className="mt-2 flex flex-wrap gap-2">
                  {swatches.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-xs">
                      <span
                        className="ring-border size-6 rounded-full ring-1"
                        style={{ backgroundColor: s.hex }}
                        title={s.hex}
                      />
                      <span className="text-muted-foreground">{s.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {mediaSummary ? (
            <>
              <Separator />
              <TypographyMuted className="text-xs">Media: {mediaSummary}</TypographyMuted>
            </>
          ) : null}
        </div>
      </div>
    </SectionBlock>
  );
}
