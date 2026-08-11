"use client";

import { format } from "date-fns";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { CalendarDisplayEvent, CalendarEventStatus } from "../_types/fixture-calendar.types";

type FixtureDetailDialogProps = {
  fixture: CalendarDisplayEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusLabelMap: Record<CalendarEventStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  postponed: "Postponed",
  abandoned: "Abandoned",
  pending: "Pending",
  processing: "Processing",
  complete: "Complete",
};

const statusVariantMap: Record<
  CalendarEventStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  scheduled: "default",
  completed: "secondary",
  postponed: "outline",
  abandoned: "destructive",
  pending: "outline",
  processing: "default",
  complete: "secondary",
};

function formatFixtureDate(fixture: CalendarDisplayEvent) {
  const startSource = fixture.start ?? `${fixture.date}T00:00:00`;
  const startDate = new Date(startSource);

  if (!fixture.end) {
    return format(startDate, fixture.start ? "EEEE, d MMMM yyyy 'at' h:mm a" : "EEEE, d MMMM yyyy");
  }

  const endDate = new Date(fixture.end);
  return `${format(startDate, "EEEE, d MMMM yyyy 'at' h:mm a")} to ${format(endDate, "EEEE, d MMMM yyyy 'at' h:mm a")}`;
}

function DetailRow({ label, value }: { label: string; value?: string | null | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </div>
      <div className="text-sm leading-relaxed">{value}</div>
    </div>
  );
}

export function FixtureDetailDialog({ fixture, open, onOpenChange }: FixtureDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {fixture ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={statusVariantMap[fixture.extendedProps.status]}>
                  {statusLabelMap[fixture.extendedProps.status]}
                </Badge>
                <Badge variant="outline">
                  {fixture.eventType === "fixture" ? "Fixture" : "Bundle production"}
                </Badge>
                <DialogTitle>
                  {fixture.eventType === "fixture" ? fixture.extendedProps.grade : "Bundle created"}
                </DialogTitle>
              </div>
              <DialogDescription className="pt-1 text-sm">
                {fixture.eventType === "fixture"
                  ? `${fixture.extendedProps.homeTeam} vs ${fixture.extendedProps.awayTeam}`
                  : fixture.extendedProps.bundleName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <DetailRow label="Date" value={formatFixtureDate(fixture)} />
              <DetailRow label="Status" value={statusLabelMap[fixture.extendedProps.status]} />
              <DetailRow label="Organisation" value={fixture.extendedProps.organisation} />
              {fixture.eventType === "fixture" ? (
                <>
                  <DetailRow label="Competition" value={fixture.extendedProps.competition} />
                  <DetailRow label="Venue" value={fixture.extendedProps.venue} />
                  <DetailRow label="Round" value={fixture.extendedProps.round} />
                  <DetailRow label="Notes" value={fixture.extendedProps.notes} />
                </>
              ) : (
                <>
                  <DetailRow label="Deliverable" value={fixture.extendedProps.deliverable} />
                  <DetailRow label="Channel" value={fixture.extendedProps.channel} />
                  <DetailRow
                    label="Production window"
                    value={fixture.extendedProps.productionWindow}
                  />
                  <DetailRow
                    label="Render count"
                    value={
                      fixture.extendedProps.renderCount !== undefined
                        ? String(fixture.extendedProps.renderCount)
                        : undefined
                    }
                  />
                  <DetailRow label="Notes" value={fixture.extendedProps.notes} />
                </>
              )}
            </div>
            {fixture.eventType === "bundle-production" ? (
              <DialogFooter>
                <Button type="button" variant="outline" disabled>
                  View
                </Button>
                {fixture.extendedProps.bundleHref ? (
                  <Button asChild type="button">
                    <Link href={fixture.extendedProps.bundleHref} target="_blank" rel="noreferrer">
                      Open
                    </Link>
                  </Button>
                ) : null}
              </DialogFooter>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
