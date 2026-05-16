import { TypographyMuted } from "@/components/typography";

import { SPONSOR_POOL_METRIC_LABELS } from "../_constants/sponsor-library-metrics";

import type { SponsorPoolStats } from "../_types/sponsor-library";

export function SponsorLibraryMetricsFooter({ stats }: { stats: SponsorPoolStats }) {
  return (
    <div className="grid w-full min-w-0 grid-cols-2 justify-items-center gap-3 text-center sm:grid-cols-4">
      {SPONSOR_POOL_METRIC_LABELS.map(({ key, label }) => (
        <div key={key} className="max-w-full space-y-0.5">
          <div className="text-foreground text-xl font-semibold tracking-tight tabular-nums">
            {stats[key]}
          </div>
          <TypographyMuted className="text-xs leading-snug">{label}</TypographyMuted>
        </div>
      ))}
    </div>
  );
}
