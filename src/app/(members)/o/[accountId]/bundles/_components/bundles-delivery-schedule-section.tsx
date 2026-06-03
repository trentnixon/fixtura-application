import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionBlock } from "@/components/ui/section";

import { BUNDLES_SCREEN_COPY } from "../_consts";

type BundlesDeliveryScheduleSectionProps = {
  settingsHref: string;
  deliveryDayLabel: string;
  nextDeliveryLabel: string;
};

/** Compact inline metrics inside season-style `SectionBlock` inset. */
export function BundlesDeliveryScheduleSection({
  settingsHref,
  deliveryDayLabel,
  nextDeliveryLabel,
}: BundlesDeliveryScheduleSectionProps) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarClock className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <h2 className="text-base leading-none font-semibold">
              {BUNDLES_SCREEN_COPY.schedulerTitle}
            </h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground text-xs">
                {BUNDLES_SCREEN_COPY.schedulerDeliveryDayLabel}
              </dt>
              <dd className="font-semibold">{deliveryDayLabel}</dd>
            </div>
            <div className="flex items-baseline gap-1.5 sm:justify-end">
              <dt className="text-muted-foreground text-xs">
                {BUNDLES_SCREEN_COPY.schedulerNextDeliveryLabel}
              </dt>
              <dd className="font-semibold tabular-nums">{nextDeliveryLabel}</dd>
            </div>
          </dl>
        </div>
        <Button variant="brandPrimaryOutline" size="sm" className="shrink-0" asChild>
          <Link href={settingsHref}>{BUNDLES_SCREEN_COPY.schedulerChangeDeliveryDayAction}</Link>
        </Button>
      </div>
    </SectionBlock>
  );
}

export function BundlesDeliveryScheduleSectionSkeleton() {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="bg-muted/40 h-14 animate-pulse rounded-lg" />
    </SectionBlock>
  );
}
