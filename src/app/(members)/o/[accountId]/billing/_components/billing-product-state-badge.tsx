"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useBillingProductStateSnapshot } from "../_hooks/useBillingProductStateSnapshot";
import { billingProductStateBadgeSurfaceClass } from "../_utils/billingProductStateDisplay";

type BillingProductStateBadgeProps = {
  accountId: string;
};

export function BillingProductStateBadge({ accountId }: BillingProductStateBadgeProps) {
  const snapshot = useBillingProductStateSnapshot(accountId);

  if (snapshot.status === "loading" || snapshot.status === "unavailable") {
    return null;
  }

  const { label, productState } = snapshot;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", billingProductStateBadgeSurfaceClass(productState))}
        aria-label={`Billing status: ${label}`}
      >
        {label}
      </Badge>
    </div>
  );
}
