import { BillingInvoiceRequestFormTierRadioOption } from "./BillingInvoiceRequestFormTierRadioOption";
import {
  billingInvoiceRequestFormCopy,
  billingInvoiceRequestTierEmptyStatusClass,
  billingInvoiceRequestTierRadiogroupClass,
} from "../../_constants/billingInvoiceRequest";
import { billingInvoiceTierKey } from "../../_utils/billingInvoiceRequest";

import type { BillingInvoiceRequestFormTierRadiosProps } from "../../_types/billingInvoiceRequest";

export function BillingInvoiceRequestFormTierRadios({
  tiers,
  selectedTierId,
  onSelectTierId,
}: BillingInvoiceRequestFormTierRadiosProps) {
  const copy = billingInvoiceRequestFormCopy;

  if (tiers.length === 0) {
    return (
      <p className={billingInvoiceRequestTierEmptyStatusClass} role="status">
        {copy.noPlansAvailable}
      </p>
    );
  }

  return (
    <div
      className={billingInvoiceRequestTierRadiogroupClass}
      role="radiogroup"
      aria-label={copy.tierRadiogroupAriaLabel}
    >
      {tiers.map((tier) => {
        const id = billingInvoiceTierKey(tier);
        return (
          <BillingInvoiceRequestFormTierRadioOption
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
