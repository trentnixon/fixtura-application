import {
  TypographyCaption,
  TypographyDataLabel,
  TypographyErrorText,
  TypographyLabel,
  TypographySuccessText,
} from "@/components/typography";
import { Button } from "@/components/ui/button";

import { BillingInvoiceRequestFormTierRadios } from "./BillingInvoiceRequestFormTierRadios";
import {
  billingInvoiceRequestFormCopy,
  billingInvoiceRequestFormIds,
  billingInvoiceRequestInputClass,
  billingInvoiceRequestTextareaClass,
} from "../../_constants/invoice-request/billingInvoiceRequest";
import { localBillingInvoiceDatetimeInputMin } from "../../_utils/invoice-request/billingInvoiceRequest";

import type { BillingInvoiceRequestFormProps } from "../../_types/invoice-request/billingInvoiceRequest";

export function BillingInvoiceRequestForm({
  tiers,
  submitSuccessMessage,
  selectedTierId,
  onSelectTierId,
  requestedStartLocal,
  onRequestedStartLocalChange,
  billingContactName,
  onBillingContactNameChange,
  billingEmail,
  onBillingEmailChange,
  billingOrganisationName,
  onBillingOrganisationNameChange,
  notes,
  onNotesChange,
  submitError,
  canSubmit,
  isSubmitting,
  onSubmit,
}: BillingInvoiceRequestFormProps) {
  const copy = billingInvoiceRequestFormCopy;
  const ids = billingInvoiceRequestFormIds;
  const startCopy = copy.requestedStart;

  return (
    <>
      {submitSuccessMessage ? (
        <TypographySuccessText role="status" tone="muted">
          {submitSuccessMessage}
        </TypographySuccessText>
      ) : null}

      <BillingInvoiceRequestFormTierRadios
        tiers={tiers}
        selectedTierId={selectedTierId}
        onSelectTierId={onSelectTierId}
      />

      <div className="grid max-w-md gap-2">
        <TypographyLabel htmlFor={ids.requestedStart}>
          {startCopy.label}{" "}
          <TypographyDataLabel as="span" className="font-normal">
            {startCopy.hintLocalUtc}
          </TypographyDataLabel>
        </TypographyLabel>
        <input
          id={ids.requestedStart}
          type="datetime-local"
          min={localBillingInvoiceDatetimeInputMin()}
          value={requestedStartLocal}
          onChange={(ev) => onRequestedStartLocalChange(ev.target.value)}
          className={billingInvoiceRequestInputClass}
        />
        <TypographyCaption>{startCopy.help}</TypographyCaption>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <TypographyLabel htmlFor={ids.contactName}>{copy.billingContactName}</TypographyLabel>
          <input
            id={ids.contactName}
            type="text"
            autoComplete="name"
            value={billingContactName}
            onChange={(ev) => onBillingContactNameChange(ev.target.value)}
            className={billingInvoiceRequestInputClass}
          />
        </div>
        <div className="grid gap-2">
          <TypographyLabel htmlFor={ids.billingEmail}>{copy.billingEmail}</TypographyLabel>
          <input
            id={ids.billingEmail}
            type="email"
            autoComplete="email"
            value={billingEmail}
            onChange={(ev) => onBillingEmailChange(ev.target.value)}
            className={billingInvoiceRequestInputClass}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <TypographyLabel htmlFor={ids.organisationName}>{copy.organisationName}</TypographyLabel>
        <input
          id={ids.organisationName}
          type="text"
          autoComplete="organization"
          value={billingOrganisationName}
          onChange={(ev) => onBillingOrganisationNameChange(ev.target.value)}
          className={billingInvoiceRequestInputClass}
        />
      </div>

      <div className="grid gap-2">
        <TypographyLabel htmlFor={ids.notes}>{copy.notesOptional}</TypographyLabel>
        <textarea
          id={ids.notes}
          value={notes}
          onChange={(ev) => onNotesChange(ev.target.value)}
          className={billingInvoiceRequestTextareaClass}
        />
      </div>

      {submitError ? <TypographyErrorText role="alert">{submitError}</TypographyErrorText> : null}

      <div>
        <Button type="button" disabled={!canSubmit} onClick={() => void onSubmit()}>
          {isSubmitting ? copy.submitting : copy.submit}
        </Button>
      </div>
    </>
  );
}
