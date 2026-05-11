import { FolderKanban } from "lucide-react";

import { TypographyH4, TypographyMuted } from "@/components/typography";

export function SponsorPoolSummaryCards({
  stats,
}: {
  stats: {
    total: number;
    placed: number;
    unassigned: number;
    inactive: number;
    archived: number;
  };
}) {
  const metrics: Array<[string, number]> = [
    ["Total sponsors", stats.total],
    ["Placed", stats.placed],
    ["Unassigned", stats.unassigned],
    ["Inactive", stats.inactive],
  ];

  return (
    <div className="bg-card text-card-foreground ring-border rounded-xl border-none p-5 shadow-sm ring-1">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">Sponsor pool summary</TypographyH4>
          <TypographyMuted className="text-xs">
            Counts across your organisation&apos;s sponsor library.
          </TypographyMuted>
        </div>
        <div className="shrink-0">
          <FolderKanban className="text-primary size-5" aria-hidden />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
            <TypographyMuted className="text-xs">{label}</TypographyMuted>
          </div>
        ))}
      </div>
    </div>
  );
}
