import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionBlock } from "@/components/ui/section";
import { captureUserAction } from "@/lib/analytics";

import { BundlesSchedulerRunStatusPill } from "./bundles-scheduler-run-status-pill";
import { BUNDLES_SCREEN_COPY } from "../_consts";
import { formatDeliveryScheduleSummary } from "../_utils/format-delivery-schedule-summary";

type BundlesDeliveryScheduleSectionProps = {
  accountId: string;
  settingsHref: string;
  deliveryDayLabel: string;
  nextDeliveryLabel: string;
  runStatusLabel: string;
  runStatusTone: "neutral" | "active";
};

/** Compact delivery summary with inline run-status pill. Active runs also surface in the banner above the table. */
export function BundlesDeliveryScheduleSection({
  accountId,
  settingsHref,
  deliveryDayLabel,
  nextDeliveryLabel,
  runStatusLabel,
  runStatusTone,
}: BundlesDeliveryScheduleSectionProps) {
  const summary = formatDeliveryScheduleSummary(deliveryDayLabel, nextDeliveryLabel);

  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <CalendarClock className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <h2 className="text-base leading-none font-semibold">
            {BUNDLES_SCREEN_COPY.schedulerTitle}
          </h2>
          <BundlesSchedulerRunStatusPill label={runStatusLabel} tone={runStatusTone} />
          <span className="text-muted-foreground hidden sm:inline" aria-hidden>
            ·
          </span>
          <p className="text-muted-foreground text-sm">{summary}</p>
        </div>
        <Button
          variant="brandPrimaryOutline"
          size="sm"
          className="shrink-0 self-start sm:self-center"
          asChild
        >
          <Link
            href={settingsHref}
            onClick={() =>
              captureUserAction("delivery_settings_link_clicked", {
                accountId,
                source: "bundles_scheduler_strip",
              })
            }
          >
            {BUNDLES_SCREEN_COPY.schedulerChangeDeliveryDayAction}
          </Link>
        </Button>
      </div>
    </SectionBlock>
  );
}

export function BundlesDeliveryScheduleSectionSkeleton() {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div className="bg-muted/40 h-10 animate-pulse rounded-lg" />
    </SectionBlock>
  );
}
