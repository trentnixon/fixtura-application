import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyDataValue,
} from "@/components/typography";
import { cn } from "@/lib/utils";

import {
  BILLING_INVOICE_REQUEST_TIER_DESCRIPTION_MAX,
  billingInvoiceRequestTierRadioButtonBaseClass,
  billingInvoiceRequestTierRadioButtonSelectedClass,
  billingInvoiceRequestTierRadioTextClass,
} from "../../_constants/invoice-request/billingInvoiceRequest";
import {
  billingInvoiceTierKey,
  formatBillingInvoiceTierMoney,
  truncateBillingInvoiceDescription,
} from "../../_utils/invoice-request/billingInvoiceRequest";

import type { BillingInvoiceRequestFormTierRadioOptionProps } from "../../_types/invoice-request/billingInvoiceRequest";

export function BillingInvoiceRequestFormTierRadioOption({
  tier,
  selected,
  onSelect,
}: BillingInvoiceRequestFormTierRadioOptionProps) {
  const id = billingInvoiceTierKey(tier);
  const primaryLabel = tier.name ?? id;
  const tc = billingInvoiceRequestTierRadioTextClass;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        billingInvoiceRequestTierRadioButtonBaseClass,
        selected && billingInvoiceRequestTierRadioButtonSelectedClass,
      )}
    >
      <TypographyBodySmall as="span" className={tc.primary}>
        {primaryLabel}
      </TypographyBodySmall>
      {tier.description ? (
        <TypographyCaption as="span" className={tc.description}>
          {truncateBillingInvoiceDescription(
            tier.description,
            BILLING_INVOICE_REQUEST_TIER_DESCRIPTION_MAX,
          )}
        </TypographyCaption>
      ) : null}
      <TypographyDataValue as="span" className={tc.price}>
        {formatBillingInvoiceTierMoney(tier.price, tier.currency)}
      </TypographyDataValue>
    </button>
  );
}
