import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { Badge } from "@/components/ui/badge";

import { DashboardBillingStatus } from "./dashboard-billing-status";

import type { DashboardViewModel } from "../dashboard-view-model";

/** Matches kitchen-sink `page.header.brand.leading`: mark left, title stack, badges below. */
type DashboardHeaderProps = {
  accountId: string;
  model: Pick<
    DashboardViewModel,
    "organisationName" | "pageDescription" | "statusBadges" | "analytics" | "logoUrl"
  >;
};

export function DashboardHeader({ accountId, model }: DashboardHeaderProps) {
  const freshness =
    model.analytics?.meta.computedAt != null
      ? `Updated ${formatRelativeHint(model.analytics.meta.computedAt)}`
      : model.analytics?.meta.staleness != null
        ? model.analytics.meta.staleness
        : null;

  const initial = model.organisationName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <header className="border-border mb-8 border-b pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        {model.logoUrl ? (
          <img
            src={model.logoUrl}
            alt={`${model.organisationName} logo`}
            width={56}
            height={56}
            className="ring-border size-14 shrink-0 rounded-xl object-cover ring-1"
          />
        ) : (
          <div
            className="ring-border bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ring-1"
            aria-hidden
          >
            {initial}
          </div>
        )}
        <div className="min-w-0 space-y-2">
          <TypographyPageTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
            {model.organisationName}
          </TypographyPageTitle>
          <TypographyPageDescription className="max-w-3xl">
            {model.pageDescription}
          </TypographyPageDescription>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <DashboardBillingStatus accountId={accountId} className="mr-1" />
        {model.statusBadges.map((b) => (
          <Badge key={b.label} variant={b.on ? "default" : "outline"}>
            {b.on ? b.label : `${b.label}: no`}
          </Badge>
        ))}
        {freshness ? (
          <Badge variant="outline" className="font-normal">
            {freshness}
          </Badge>
        ) : null}
      </div>
    </header>
  );
}

function formatRelativeHint(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
