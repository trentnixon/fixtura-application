import { Archive } from "lucide-react";
import Link from "next/link";

import { TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { SPONSOR_POOL_METRIC_LABELS } from "../_constants/sponsor-library-metrics";

import type { SponsorPoolStats } from "../_types/sponsor-library";

type SponsorLibraryMetricsFooterProps = {
  accountId: string;
  stats: SponsorPoolStats;
};

export function SponsorLibraryMetricsFooter({
  accountId,
  stats,
}: SponsorLibraryMetricsFooterProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid min-w-0 flex-1 grid-cols-2 justify-items-center gap-3 text-center sm:grid-cols-4">
        {SPONSOR_POOL_METRIC_LABELS.map(({ key, label }) => (
          <div key={key} className="max-w-full space-y-0.5">
            <div className="text-foreground text-xl font-semibold tracking-tight tabular-nums">
              {stats[key]}
            </div>
            <TypographyMuted className="text-xs leading-snug">{label}</TypographyMuted>
          </div>
        ))}
      </div>
      <Button variant="warningOutline" size="sm" className="shrink-0" asChild>
        <Link href={accountScopedRoutes.manageSponsorsArchive(accountId)}>
          <Archive aria-hidden />
          View archive
        </Link>
      </Button>
    </div>
  );
}
