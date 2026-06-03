import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { DashboardBillingStatus } from "./dashboard-billing-status";

import type { DashboardViewModel } from "../dashboard-view-model";

const dashboardStatusBadgeBase = "text-xs font-medium";

const dashboardStatusBadgeNeutral = "border-border bg-muted/40 text-muted-foreground";

const dashboardStatusBadgeActive =
  "border-emerald-500/35 bg-emerald-500/12 text-emerald-950 dark:text-emerald-50";

type DashboardAccountStatusStripProps = {
  accountId: string;
  model: Pick<DashboardViewModel, "settings">;
  className?: string;
};

export function DashboardAccountStatusStrip({
  accountId,
  model,
  className,
}: DashboardAccountStatusStripProps) {
  const isProcessing = model.settings?.isUpdating === true;

  return (
    <div className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", className)}>
      <DashboardBillingStatus accountId={accountId} />
      {model.settings ? (
        <Badge
          variant="outline"
          className={cn(
            dashboardStatusBadgeBase,
            isProcessing ? dashboardStatusBadgeActive : dashboardStatusBadgeNeutral,
          )}
        >
          {isProcessing ? "Processing" : "Inactive"}
        </Badge>
      ) : null}
    </div>
  );
}
