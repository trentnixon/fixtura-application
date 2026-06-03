"use client";

import { TypographyPageDescription } from "@/components/typography";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isAccountSchedulerGatewayRedirect,
  useAccountScheduler,
} from "@/lib/api/hooks/account/useAccountScheduler";

import { BundlesSchedulerRunStatusPill } from "./bundles-scheduler-run-status-pill";
import { BUNDLES_SCREEN_COPY } from "../_consts";
import { resolveSchedulerRunStatus } from "../_utils";

export function BundlesScreenHeaderRunStatus({ accountId }: { accountId: string }) {
  const schedulerQuery = useAccountScheduler(accountId);

  if (schedulerQuery.isPending) {
    return (
      <div className="flex max-w-3xl flex-wrap items-center gap-2" aria-busy="true">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
    );
  }

  const schedulerDoc =
    schedulerQuery.isSuccess &&
    schedulerQuery.data &&
    !isAccountSchedulerGatewayRedirect(schedulerQuery.data)
      ? schedulerQuery.data.data.scheduler
      : null;

  if (!schedulerDoc) {
    return (
      <TypographyPageDescription className="max-w-3xl">
        {BUNDLES_SCREEN_COPY.schedulerRunStatusUnavailable}
      </TypographyPageDescription>
    );
  }

  const runStatus = resolveSchedulerRunStatus(schedulerDoc);

  return (
    <p className="text-muted-foreground flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed">
      <span className="text-[10px] font-semibold tracking-tight uppercase">
        {BUNDLES_SCREEN_COPY.schedulerRunStatusLabel}
      </span>
      <BundlesSchedulerRunStatusPill label={runStatus.label} tone={runStatus.tone} />
      <span>{runStatus.description}</span>
    </p>
  );
}
