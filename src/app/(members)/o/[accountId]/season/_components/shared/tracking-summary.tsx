import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionLabel } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  formatTrackingUpdatedAt,
  formatTrackingUpdatedAtAbsolute,
} from "../_utils/format-tracking-updated-at";

export type TrackingSummaryCounts = {
  competitions: number;
  grades: number;
  teams: number;
  fixtures: number;
};

export type TrackingSummaryProps = {
  counts: TrackingSummaryCounts;
  lastUpdatedAt?: string | null | undefined;
  isPending?: boolean;
  title?: string;
  showTitle?: boolean;
  /** `inset` wraps stats in the slate SectionBlock; `none` renders content only for nested containers. */
  shell?: "inset" | "none";
};

function TrackingSummaryStat({ value, label }: { value: number; label: string }) {
  return (
    <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
      <SectionLabel
        variant="kicker"
        className="text-foreground text-2xl leading-none font-bold tracking-normal normal-case tabular-nums"
      >
        {value}
      </SectionLabel>
      <SectionLabel
        variant="kicker"
        className="text-muted-foreground truncate text-sm tracking-tight uppercase"
      >
        {label}
      </SectionLabel>
    </Surface>
  );
}

function TrackingSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="min-h-16 rounded-2xl" />
      ))}
    </div>
  );
}

export function TrackingSummary({
  counts,
  lastUpdatedAt,
  isPending = false,
  title = "Tracking summary",
  showTitle = true,
  shell = "inset",
}: TrackingSummaryProps) {
  const content = (
    <>
      {showTitle || lastUpdatedAt ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            showTitle ? "justify-between" : "justify-end",
          )}
        >
          {showTitle ? (
            <SectionLabel
              variant="kicker"
              className={cn(
                "text-sm font-semibold tracking-normal normal-case",
                shell === "inset" ? "text-slate-900" : "text-foreground",
              )}
            >
              {title}
            </SectionLabel>
          ) : null}
          {lastUpdatedAt ? (
            <Badge
              variant="secondary"
              title={formatTrackingUpdatedAtAbsolute(lastUpdatedAt)}
              className={cn(
                "px-2 py-1",
                shell === "inset"
                  ? "border-white/20 bg-white/10 text-slate-900"
                  : "border-border bg-muted/50 text-foreground",
              )}
            >
              Updated {formatTrackingUpdatedAt(lastUpdatedAt)}
            </Badge>
          ) : null}
        </div>
      ) : null}
      {isPending ? (
        <TrackingSummarySkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TrackingSummaryStat value={counts.competitions} label="Competitions" />
          <TrackingSummaryStat value={counts.grades} label="Grades" />
          <TrackingSummaryStat value={counts.teams} label="Teams" />
          <TrackingSummaryStat value={counts.fixtures} label="Fixtures" />
        </div>
      )}
    </>
  );

  if (shell === "none") {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <SectionBlock variant="inset" className="bg-slate-100 text-slate-900">
      {content}
    </SectionBlock>
  );
}
