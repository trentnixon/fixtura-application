import { TypographyBodySmall } from "@/components/typography";

import { BillingPlanCheckoutFormTierRadioOption } from "./BillingPlanCheckoutFormTierRadioOption";
import {
  billingPlanCheckoutFormCopy,
  billingPlanCheckoutTierEmptyStatusClass,
  billingPlanCheckoutTierRadiogroupClass,
} from "../_constants/billingPlanCheckout";
import { billingPlanCheckoutTierKey } from "../_utils/billingPlanCheckout";

import type { BillingPlanCheckoutFormTierRadiosProps } from "../_types/billingPlanCheckout";

export function BillingPlanCheckoutFormTierRadios({
  tiers,
  selectedTierId,
  onSelectTierId,
}: BillingPlanCheckoutFormTierRadiosProps) {
  const copy = billingPlanCheckoutFormCopy;

  if (tiers.length === 0) {
    return (
      <TypographyBodySmall className={billingPlanCheckoutTierEmptyStatusClass} role="status">
        {copy.noPlansAvailable}
      </TypographyBodySmall>
    );
  }

  return (
    <div
      className={billingPlanCheckoutTierRadiogroupClass}
      role="radiogroup"
      aria-label={copy.tierRadiogroupAriaLabel}
    >
      {tiers.map((tier) => {
        const id = billingPlanCheckoutTierKey(tier);
        return (
          <BillingPlanCheckoutFormTierRadioOption
            key={id}
            tier={tier}
            selected={selectedTierId === id}
            onSelect={() => onSelectTierId(id)}
          />
        );
      })}
    </div>
  );
}
