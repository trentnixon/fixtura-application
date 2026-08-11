import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { DashboardBillingStatus } from "./dashboard-billing-status";

import type { DashboardViewModel } from "../dashboard-view-model";

const dashboardStatusBadgeBase = "text-xs font-medium";

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
  return (
    <div className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", className)}>
      <DashboardBillingStatus accountId={accountId} />
      {model.settings?.isUpdating === true ? (
        <Badge
          variant="outline"
          className={cn(dashboardStatusBadgeBase, dashboardStatusBadgeActive)}
        >
          Processing
        </Badge>
      ) : null}
    </div>
  );
}
