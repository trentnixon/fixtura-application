"use client";

import { IconPalette } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo } from "react";

import { templateModeLabel } from "@/components/pickers/template-mode/_utils";
import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { readTemplateModeId } from "@/features/branding/components/branding-workspace/_utils";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";
import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { buildBrandingRouteCard } from "../_utils/build-organisation-route-cards";

import type { BrandingRoutePaletteSwatch } from "../_utils/build-organisation-route-cards";

const LOOK_AND_FEEL_CTA_CLASS =
  "border-primary text-primary hover:bg-primary/10 hover:text-primary";

function FlushSectionLabel({ children }: { children: string }) {
  return (
    <TypographyMuted className="text-[10px] font-semibold tracking-wide uppercase">
      {children}
    </TypographyMuted>
  );
}

function BrandPaletteSwatches({ swatches }: { swatches: BrandingRoutePaletteSwatch[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3" role="list" aria-label="Brand colours">
      {swatches.map((swatch) => (
        <div key={swatch.key} role="listitem" className="space-y-2">
          <div
            className="ring-border h-11 w-full rounded-lg ring-1"
            style={{ backgroundColor: swatch.hex }}
            title={`${swatch.key}: ${swatch.hex}`}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-xs font-medium capitalize">{swatch.key}</p>
            <p className="text-muted-foreground truncate font-mono text-[10px] uppercase">
              {swatch.hex}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandingFlushSkeleton() {
  return (
    <div className="grid grid-cols-1 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className={index === 0 ? "h-36 w-full" : "h-16 w-full"} />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

/** `container.block.flush.default` — padded header, flush divided body sections. */
export function DashboardBrandingRouteCard({
  accountId,
  logoUrl,
}: {
  accountId: string;
  logoUrl: string | null;
}) {
  const brandingQuery = useAccountBranding(accountId);
  const templateModesQuery = useTemplateModesUi();

  const brandingData =
    brandingQuery.data && !isAccountBrandingGatewayRedirect(brandingQuery.data)
      ? brandingQuery.data.data
      : null;

  const view = buildBrandingRouteCard({ branding: brandingData, logoUrl });
  const isPending = brandingQuery.isPending;

  const contrastModeLabel = useMemo(() => {
    const modes = templateModesQuery.data?.data ?? [];
    const savedId = readTemplateModeId(brandingData?.template_option ?? null);
    if (savedId === null) return null;
    const mode = modes.find((item) => item.id === savedId);
    return mode ? templateModeLabel(mode) : null;
  }, [brandingData?.template_option, templateModesQuery.data]);

  const logoHref = accountScopedRoutes.brandLogo(accountId);
  const brandingHref = accountScopedRoutes.branding(accountId);

  return (
    <div className="bg-background rounded-lg border">
      <div className="px-5 py-4">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <TypographyH4 className="text-sm font-semibold">{view.title}</TypographyH4>
            <TypographyMuted className="text-xs">{view.description}</TypographyMuted>
          </div>
          <IconPalette className="text-primary size-5 shrink-0" stroke={1.5} aria-hidden />
        </div>
      </div>

      <Separator />

      {isPending ? (
        <BrandingFlushSkeleton />
      ) : (
        <div className="grid grid-cols-1 divide-y lg:grid-cols-3 lg:items-stretch lg:divide-x lg:divide-y-0">
          <div className="flex flex-col px-5 py-4">
            <FlushSectionLabel>Organisation logo</FlushSectionLabel>
            {view.logoUrl ? (
              <div className="bg-muted/30 ring-border mt-3 flex min-h-36 flex-1 items-center justify-center rounded-lg p-4 ring-1">
                <img
                  src={view.logoUrl}
                  alt="Organisation logo"
                  className="size-full max-h-40 object-contain"
                />
              </div>
            ) : (
              <TypographyMuted className="mt-3 flex min-h-36 flex-1 items-center text-sm">
                Not uploaded yet
              </TypographyMuted>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="xs" className={LOOK_AND_FEEL_CTA_CLASS} asChild>
                <Link href={logoHref}>Update logo</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col px-5 py-4">
            <FlushSectionLabel>Brand colours</FlushSectionLabel>
            {view.paletteSwatches.length > 0 ? (
              <div className="flex-1">
                <BrandPaletteSwatches swatches={view.paletteSwatches} />
              </div>
            ) : (
              <TypographyMuted className="mt-3 flex-1 text-sm">Not configured yet</TypographyMuted>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="xs" className={LOOK_AND_FEEL_CTA_CLASS} asChild>
                <Link href={brandingHref}>Update branding</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col px-5 py-4">
            <FlushSectionLabel>Contrast</FlushSectionLabel>
            {templateModesQuery.isPending ? (
              <Skeleton className="mt-3 h-5 w-24 flex-1" />
            ) : (
              <p className="mt-3 flex-1 text-sm font-medium">{contrastModeLabel ?? "Not set"}</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="xs" className={LOOK_AND_FEEL_CTA_CLASS} asChild>
                <Link href={brandingHref}>Update contrast</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
