import { TypographyAlertDescription, TypographyAlertTitle } from "@/components/typography";

import {
  BILLING_ENDING_BANNER_DESCRIPTION_LEAD,
  BILLING_ENDING_BANNER_TITLE,
} from "../../_constants/overview/billingEndingBanner";
import {
  billingEndingBannerPeriodEndTrail,
  shouldShowBillingEndingBanner,
} from "../../_utils/overview/billingEndingBanner";

import type { BillingEndingBannerProps } from "../../_types/overview/billingEndingBanner";

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
      <TypographyAlertTitle as="p">{BILLING_ENDING_BANNER_TITLE}</TypographyAlertTitle>
      <TypographyAlertDescription className="mt-1" tone="muted">
        {BILLING_ENDING_BANNER_DESCRIPTION_LEAD}
        {periodEndTrail}
      </TypographyAlertDescription>
    </div>
  );
}
