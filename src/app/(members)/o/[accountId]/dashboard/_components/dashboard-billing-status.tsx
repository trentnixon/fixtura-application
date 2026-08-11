"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useBillingProductStateSnapshot } from "../../billing/_hooks/useBillingProductStateSnapshot";
import { billingProductStateBadgeSurfaceClass } from "../../billing/_utils/overview/billingProductStateDisplay";

type DashboardBillingStatusProps = {
  accountId: string;
  className?: string;
};

/** Billing product state as an outline badge (matches billing page chip styles). */
export function DashboardBillingStatus({ accountId, className }: DashboardBillingStatusProps) {
  const snapshot = useBillingProductStateSnapshot(accountId);

  if (snapshot.status === "loading") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium",
          "border-border bg-muted/40 text-muted-foreground",
          className,
        )}
        aria-busy
      >
        Billing status…
      </Badge>
    );
  }

  if (snapshot.status === "unavailable") {
    return null;
  }

  const { label, productState } = snapshot;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        billingProductStateBadgeSurfaceClass(productState),
        className,
      )}
      aria-label={`Billing status: ${label}`}
    >
      {label}
    </Badge>
  );
}
