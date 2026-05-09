import { TypographyBodySmall } from "@/components/typography";

import { BILLING_CHECKOUT_RETURN_BANNER_MESSAGE_BY_OUTCOME } from "../../_constants/checkout/billingCheckoutReturnBanner";

import type { CheckoutReturnBannerProps } from "../../_types/checkout/billingCheckoutReturn";

export function CheckoutReturnBanner({ outcome }: CheckoutReturnBannerProps) {
  return (
    <div className="bg-muted/50 border-border mb-4 rounded-lg border px-4 py-3" role="status">
      <TypographyBodySmall>
        {BILLING_CHECKOUT_RETURN_BANNER_MESSAGE_BY_OUTCOME[outcome]}
      </TypographyBodySmall>
    </div>
  );
}
