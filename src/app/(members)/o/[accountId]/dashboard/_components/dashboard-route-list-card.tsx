import { Circle, CircleCheck } from "lucide-react";
import Link from "next/link";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type DashboardRoutePaletteSwatch = {
  key: string;
  hex: string;
};

export type DashboardRouteLogoPreview = {
  url: string;
  alt: string;
};

export type DashboardRouteActiveRatio = {
  active: number;
  total: number;
};

export type DashboardRouteChecklistItem = {
  label: string;
  complete: boolean;
  swatches?: DashboardRoutePaletteSwatch[];
  logoPreview?: DashboardRouteLogoPreview;
  activeRatio?: DashboardRouteActiveRatio;
};

export type DashboardRouteListCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  items: DashboardRouteChecklistItem[];
  headerIcon: ReactNode;
  isPending?: boolean;
};

function PaletteSwatches({ swatches }: { swatches: DashboardRoutePaletteSwatch[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2" role="list" aria-label="Palette colours">
      {swatches.map((swatch) => (
        <div
          key={swatch.key}
          role="listitem"
          className="flex items-center gap-1.5 text-xs"
          title={`${swatch.key}: ${swatch.hex}`}
        >
          <span
            className="ring-border size-5 shrink-0 rounded-full ring-1"
            style={{ backgroundColor: swatch.hex }}
            aria-hidden
          />
          <span className="text-muted-foreground capitalize">{swatch.key}</span>
        </div>
      ))}
    </div>
  );
}

function LogoPreview({ url, alt }: DashboardRouteLogoPreview) {
  return (
    <div className="mt-2">
      <img
        src={url}
        alt={alt}
        className="ring-border bg-muted/30 max-h-20 max-w-[10rem] rounded-lg object-contain p-2 ring-1"
      />
    </div>
  );
}

function ActiveSponsorsProgress({ active, total }: DashboardRouteActiveRatio) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {total > 0 ? `${active} of ${total} active` : "No sponsors to measure"}
        </span>
        <span className="text-muted-foreground tabular-nums">{pct}%</span>
      </div>
      <div
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of sponsors active`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            pct === 100 ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ChecklistRow({
  label,
  complete,
  swatches,
  logoPreview,
  activeRatio,
}: DashboardRouteChecklistItem) {
  const Icon = complete ? CircleCheck : Circle;
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          complete ? "text-success" : "text-muted-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <span className="text-sm">{label}</span>
        {activeRatio ? <ActiveSponsorsProgress {...activeRatio} /> : null}
        {logoPreview ? <LogoPreview {...logoPreview} /> : null}
        {swatches && swatches.length > 0 ? <PaletteSwatches swatches={swatches} /> : null}
      </div>
    </div>
  );
}

function ChecklistSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}

/** `card.standard.list` — checklist body and full-width footer link. */
export function DashboardRouteListCard({
  title,
  description,
  href,
  ctaLabel,
  items,
  headerIcon,
  isPending = false,
}: DashboardRouteListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardAction>{headerIcon}</CardAction>
        <TypographyH3 className="text-lg leading-none font-semibold">{title}</TypographyH3>
        <TypographyMuted>{description}</TypographyMuted>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <ChecklistSkeleton />
        ) : (
          <div className="divide-border divide-y">
            {items.map((item) => (
              <ChecklistRow key={item.label} {...item} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button variant="brand" className="w-full" asChild disabled={isPending}>
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
