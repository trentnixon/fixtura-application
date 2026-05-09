"use client";

import { cn } from "@/lib/utils";

import { useBillingProductStateSnapshot } from "../../billing/_hooks/useBillingProductStateSnapshot";
import { billingProductStateToneClass } from "../../billing/_utils/billingProductStateDisplay";

type DashboardBillingStatusProps = {
  accountId: string;
  className?: string;
};

/** Same derivation as the billing page status badge, as inline text. Use the hook for custom UI. */
export function DashboardBillingStatus({ accountId, className }: DashboardBillingStatusProps) {
  const snapshot = useBillingProductStateSnapshot(accountId);

  if (snapshot.status === "loading") {
    return (
      <span className={cn("text-muted-foreground text-sm", className)} aria-busy>
        Billing status…
      </span>
    );
  }

  if (snapshot.status === "unavailable") {
    return null;
  }

  const { label, productState } = snapshot;

  return (
    <span
      className={cn("text-sm font-medium", billingProductStateToneClass(productState), className)}
      aria-label={`Billing status: ${label}`}
    >
      {label}
    </span>
  );
}
