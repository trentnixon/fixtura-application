import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyDataValue,
} from "@/components/typography";
import { cn } from "@/lib/utils";

import {
  BILLING_PLAN_CHECKOUT_TIER_DESCRIPTION_MAX,
  billingPlanCheckoutTierRadioButtonBaseClass,
  billingPlanCheckoutTierRadioButtonSelectedClass,
  billingPlanCheckoutTierRadioTextClass,
} from "../_constants/billingPlanCheckout";
import {
  billingPlanCheckoutTierKey,
  formatBillingPlanCheckoutMoney,
  truncateBillingPlanCheckoutDescription,
} from "../_utils/billingPlanCheckout";

import type { BillingPlanCheckoutFormTierRadioOptionProps } from "../_types/billingPlanCheckout";

export function BillingPlanCheckoutFormTierRadioOption({
  tier,
  selected,
  onSelect,
}: BillingPlanCheckoutFormTierRadioOptionProps) {
  const id = billingPlanCheckoutTierKey(tier);
  const primaryLabel = tier.name ?? id;
  const tc = billingPlanCheckoutTierRadioTextClass;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        billingPlanCheckoutTierRadioButtonBaseClass,
        selected && billingPlanCheckoutTierRadioButtonSelectedClass,
      )}
    >
      <TypographyBodySmall as="span" className={tc.primary}>
        {primaryLabel}
      </TypographyBodySmall>
      {tier.description ? (
        <TypographyCaption as="span" className={tc.description}>
          {truncateBillingPlanCheckoutDescription(
            tier.description,
            BILLING_PLAN_CHECKOUT_TIER_DESCRIPTION_MAX,
          )}
        </TypographyCaption>
      ) : null}
      <TypographyDataValue as="span" className={tc.price}>
        {formatBillingPlanCheckoutMoney(tier.price, tier.currency)}
      </TypographyDataValue>
    </button>
  );
}
