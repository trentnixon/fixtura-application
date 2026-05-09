import { TypographyBodySmall } from "@/components/typography";

import { BillingInvoiceRequestFormTierRadioOption } from "./BillingInvoiceRequestFormTierRadioOption";
import {
  billingInvoiceRequestFormCopy,
  billingInvoiceRequestTierEmptyStatusClass,
  billingInvoiceRequestTierRadiogroupClass,
} from "../../_constants/invoice-request/billingInvoiceRequest";
import { billingInvoiceTierKey } from "../../_utils/invoice-request/billingInvoiceRequest";

import type { BillingInvoiceRequestFormTierRadiosProps } from "../../_types/invoice-request/billingInvoiceRequest";

export function BillingInvoiceRequestFormTierRadios({
  tiers,
  selectedTierId,
  onSelectTierId,
}: BillingInvoiceRequestFormTierRadiosProps) {
  const copy = billingInvoiceRequestFormCopy;

  if (tiers.length === 0) {
    return (
      <TypographyBodySmall className={billingInvoiceRequestTierEmptyStatusClass} role="status">
        {copy.noPlansAvailable}
      </TypographyBodySmall>
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
