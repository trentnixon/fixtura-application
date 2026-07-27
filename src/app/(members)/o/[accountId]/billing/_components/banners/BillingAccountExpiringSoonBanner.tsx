import { TypographyMuted } from "@/components/typography";

import { formatAccountExpiringSoonStatus } from "../../_utils/orders/orderSeasonPassDisplayState";

export type BillingAccountExpiringSoonBannerProps = {
  daysUntilEnd: number;
};

/** Compact notice when the active paid pass is within the ending-soon window. */
export function BillingAccountExpiringSoonBanner({
  daysUntilEnd,
}: BillingAccountExpiringSoonBannerProps) {
  return (
    <TypographyMuted
      as="p"
      className="text-sm leading-snug"
      role="status"
      data-testid="billing-account-expiring-soon-banner"
    >
      {formatAccountExpiringSoonStatus(daysUntilEnd)}
    </TypographyMuted>
  );
}
