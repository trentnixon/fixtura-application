import {
  BILLING_ENDING_BANNER_DESCRIPTION_LEAD,
  BILLING_ENDING_BANNER_TITLE,
} from "../../_constants/billingEndingBanner";
import {
  billingEndingBannerPeriodEndTrail,
  shouldShowBillingEndingBanner,
} from "../../_utils/billingEndingBanner";

import type { BillingEndingBannerProps } from "../../_types/billingEndingBanner";

/** Secondary marker — does not change primary billing UI mode when order is active. */
export function BillingEndingBanner({ order }: BillingEndingBannerProps) {
  if (!shouldShowBillingEndingBanner(order)) {
    return null;
  }
  const periodEndTrail = billingEndingBannerPeriodEndTrail(order.endOrderAt);

  return (
    <div
      className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm"
      role="status"
      data-testid="billing-ending-banner"
    >
      <p className="text-foreground font-medium">{BILLING_ENDING_BANNER_TITLE}</p>
      <p className="text-muted-foreground mt-1">
        {BILLING_ENDING_BANNER_DESCRIPTION_LEAD}
        {periodEndTrail}
      </p>
    </div>
  );
}
