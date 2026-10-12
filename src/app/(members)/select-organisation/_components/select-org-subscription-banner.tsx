import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  selectOrgSubscriptionDescription,
  selectOrgSubscriptionLabel,
} from "../_utils/select-org-subscription-status";

import type {
  SelectOrgSubscriptionBadgeState,
  SelectOrgSubscriptionStatus,
} from "../_utils/select-org-subscription-status";

function subscriptionBannerClass(status: SelectOrgSubscriptionStatus): string {
  switch (status) {
    case "active":
      return "bg-success-600/10 text-success-600";
    case "ending-soon":
      return "bg-amber-500/15 text-amber-800 dark:text-amber-200";
    case "none":
      return "bg-destructive text-white";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function SelectOrgSubscriptionBanner({
  status,
}: {
  status: SelectOrgSubscriptionBadgeState;
}) {
  if (status === "loading") {
    return <Skeleton className="h-7 w-full rounded-none" aria-hidden />;
  }

  const label = selectOrgSubscriptionLabel(status);

  return (
    <p
      title={selectOrgSubscriptionDescription(status)}
      className={cn(
        "w-full px-2 py-1.5 text-center text-[10px] leading-tight font-semibold tracking-wide uppercase",
        subscriptionBannerClass(status),
      )}
    >
      {label}
    </p>
  );
}
