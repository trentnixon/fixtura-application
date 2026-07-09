"use client";

import { CircleCheck } from "lucide-react";

import { TypographyH4, TypographyMuted, TypographyOverline } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";
import { cn } from "@/lib/utils";

import { BUNDLES_SCREEN_COPY } from "../_consts";
import { BUNDLES_ACTIVE_RUN_BANNER_SURFACE_CLASS_NAME } from "../_consts/active-run-banner";
import { resolveSchedulerRunStatus } from "../_utils";

/** Shown above the render table when a bundle run is queued or rendering. */
export function BundlesActiveRunBanner({ accountId }: { accountId: string }) {
  const schedulerQuery = useAccountScheduler(accountId);

  if (schedulerQuery.isPending || schedulerQuery.isError) {
    return null;
  }

  const schedulerDoc =
    schedulerQuery.data && !isAccountSchedulerGatewayRedirect(schedulerQuery.data)
      ? schedulerQuery.data.data.scheduler
      : null;

  if (!schedulerDoc) {
    return null;
  }

  const runStatus = resolveSchedulerRunStatus(schedulerDoc);

  if (runStatus.tone !== "active") {
    return null;
  }

  return (
    <Surface
      className={cn(BUNDLES_ACTIVE_RUN_BANNER_SURFACE_CLASS_NAME, "space-y-3 p-4 shadow-md sm:p-5")}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <TypographyOverline className="block">
            {BUNDLES_SCREEN_COPY.schedulerRunStatusLabel}
          </TypographyOverline>
          <TypographyH4 className="text-success text-sm font-semibold">
            {runStatus.label}
          </TypographyH4>
          <TypographyMuted className="text-sm leading-relaxed">
            {runStatus.description}
          </TypographyMuted>
        </div>
        <CircleCheck className="text-success size-5 shrink-0" aria-hidden />
      </div>
    </Surface>
  );
}
