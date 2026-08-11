import { cn } from "@/lib/utils";

import { formatAccountExpiringSoonStatus } from "../../_utils/orders/orderSeasonPassDisplayState";

export type BillingAccountExpiringSoonBannerProps = {
  daysUntilEnd: number;
};

/** Compact notice when the active paid pass is within the ending-soon window. */
export function BillingAccountExpiringSoonBanner({
  daysUntilEnd,
}: BillingAccountExpiringSoonBannerProps) {
  return (
    <p
      role="status"
      data-testid="billing-account-expiring-soon-banner"
      className={cn("text-muted-foreground font-sans text-sm leading-snug")}
    >
      {formatAccountExpiringSoonStatus(daysUntilEnd)}
    </p>
  );
}
