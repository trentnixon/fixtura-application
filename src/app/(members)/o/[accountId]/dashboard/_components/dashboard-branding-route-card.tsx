"use client";

import { IconPalette } from "@tabler/icons-react";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isAccountBrandingGatewayRedirect,
  useAccountBranding,
} from "@/lib/api/hooks/account/useAccountBranding";

import { buildBrandingRouteCard } from "../_utils/build-organisation-route-cards";

import type { BrandingRoutePaletteSwatch } from "../_utils/build-organisation-route-cards";

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
    <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="space-y-3 px-5 py-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className={index === 0 ? "h-36 w-full" : "h-16 w-full"} />
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

  const brandingData =
    brandingQuery.data && !isAccountBrandingGatewayRedirect(brandingQuery.data)
      ? brandingQuery.data.data
      : null;

  const view = buildBrandingRouteCard({ branding: brandingData, logoUrl });
  const isPending = brandingQuery.isPending;

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
        <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:items-stretch lg:divide-x lg:divide-y-0">
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
          </div>

          <div className="px-5 py-4">
            <FlushSectionLabel>Brand colours</FlushSectionLabel>
            {view.paletteSwatches.length > 0 ? (
              <BrandPaletteSwatches swatches={view.paletteSwatches} />
            ) : (
              <TypographyMuted className="mt-3 text-sm">Not configured yet</TypographyMuted>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
