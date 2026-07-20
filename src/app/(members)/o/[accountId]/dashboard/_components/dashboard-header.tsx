import { Plus } from "lucide-react";
import Link from "next/link";

import { TypographyMuted, TypographyPageTitle } from "@/components/typography";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { DashboardAccountStatusStrip } from "./dashboard-account-status-strip";

import type { DashboardViewModel } from "../dashboard-view-model";

const LOGO_SIZE_PX = 96;

/** Matches kitchen-sink `page.header.brand.leading`: mark left, title stack, status badges right. */
type DashboardHeaderProps = {
  accountId: string;
  model: Pick<DashboardViewModel, "organisationName" | "logoUrl" | "analytics" | "settings">;
};

export function DashboardHeader({ accountId, model }: DashboardHeaderProps) {
  const brandLogoHref = accountScopedRoutes.brandLogo(accountId);

  const freshness =
    model.analytics?.meta.computedAt != null
      ? `Updated ${formatAnalyticsTimestamp(model.analytics.meta.computedAt)}`
      : model.analytics?.meta.staleness != null
        ? model.analytics.meta.staleness
        : null;

  return (
    <header className="border-border border-b pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {model.logoUrl ? (
            <Link
              href={brandLogoHref}
              className="ring-border focus-visible:ring-ring shrink-0 rounded-xl ring-1 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Edit ${model.organisationName} logo`}
            >
              <img
                src={model.logoUrl}
                alt=""
                width={LOGO_SIZE_PX}
                height={LOGO_SIZE_PX}
                className="size-24 rounded-xl object-cover"
              />
            </Link>
          ) : (
            <Link
              href={brandLogoHref}
              className="border-border text-muted-foreground hover:border-primary hover:text-primary focus-visible:ring-ring flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Add logo for ${model.organisationName}`}
            >
              <Plus className="size-5" strokeWidth={1.75} aria-hidden />
              <span className="text-[11px] font-medium tracking-wide">Add logo</span>
            </Link>
          )}
          <div className="min-w-0 space-y-2">
            <TypographyPageTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
              {model.organisationName}
            </TypographyPageTitle>
            {freshness ? (
              <TypographyMuted className="text-xs leading-5">{freshness}</TypographyMuted>
            ) : null}
          </div>
        </div>
        <DashboardAccountStatusStrip accountId={accountId} model={model} className="sm:pt-1" />
      </div>
    </header>
  );
}

function formatAnalyticsTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
