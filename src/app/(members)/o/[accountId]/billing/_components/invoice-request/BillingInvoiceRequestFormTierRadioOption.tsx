import { cn } from "@/lib/utils";

import {
  BILLING_INVOICE_REQUEST_TIER_DESCRIPTION_MAX,
  billingInvoiceRequestTierRadioButtonBaseClass,
  billingInvoiceRequestTierRadioButtonSelectedClass,
  billingInvoiceRequestTierRadioTextClass,
} from "../../_constants/billingInvoiceRequest";
import {
  billingInvoiceTierKey,
  formatBillingInvoiceTierMoney,
  truncateBillingInvoiceDescription,
} from "../../_utils/billingInvoiceRequest";

import type { BillingInvoiceRequestFormTierRadioOptionProps } from "../../_types/billingInvoiceRequest";

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
      <p className={tc.primary}>{primaryLabel}</p>
      {tier.description ? (
        <p className={tc.description}>
          {truncateBillingInvoiceDescription(
            tier.description,
            BILLING_INVOICE_REQUEST_TIER_DESCRIPTION_MAX,
          )}
        </p>
      ) : null}
      <p className={tc.price}>{formatBillingInvoiceTierMoney(tier.price, tier.currency)}</p>
    </button>
  );
}
