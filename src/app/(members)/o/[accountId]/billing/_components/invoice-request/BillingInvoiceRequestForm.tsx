import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { BillingInvoiceRequestFormTierRadios } from "./BillingInvoiceRequestFormTierRadios";
import {
  billingInvoiceRequestFormCopy,
  billingInvoiceRequestFormIds,
  billingInvoiceRequestInputClass,
  billingInvoiceRequestTextareaClass,
} from "../../_constants/billingInvoiceRequest";
import { localBillingInvoiceDatetimeInputMin } from "../../_utils/billingInvoiceRequest";

import type { BillingInvoiceRequestFormProps } from "../../_types/billingInvoiceRequest";

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
        <p className="text-muted-foreground text-sm" role="status">
          {submitSuccessMessage}
        </p>
      ) : null}

      <BillingInvoiceRequestFormTierRadios
        tiers={tiers}
        selectedTierId={selectedTierId}
        onSelectTierId={onSelectTierId}
      />

      <div className="grid max-w-md gap-2">
        <Label htmlFor={ids.requestedStart}>
          {startCopy.label}{" "}
          <span className="text-muted-foreground font-normal">{startCopy.hintLocalUtc}</span>
        </Label>
        <input
          id={ids.requestedStart}
          type="datetime-local"
          min={localBillingInvoiceDatetimeInputMin()}
          value={requestedStartLocal}
          onChange={(ev) => onRequestedStartLocalChange(ev.target.value)}
          className={billingInvoiceRequestInputClass}
        />
        <p className="text-muted-foreground text-xs">{startCopy.help}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={ids.contactName}>{copy.billingContactName}</Label>
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
          <Label htmlFor={ids.billingEmail}>{copy.billingEmail}</Label>
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
        <Label htmlFor={ids.organisationName}>{copy.organisationName}</Label>
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
        <Label htmlFor={ids.notes}>{copy.notesOptional}</Label>
        <textarea
          id={ids.notes}
          value={notes}
          onChange={(ev) => onNotesChange(ev.target.value)}
          className={billingInvoiceRequestTextareaClass}
        />
      </div>

      {submitError ? (
        <p className="text-destructive text-sm" role="alert">
          {submitError}
        </p>
      ) : null}

      <div>
        <Button type="button" disabled={!canSubmit} onClick={() => void onSubmit()}>
          {isSubmitting ? copy.submitting : copy.submit}
        </Button>
      </div>
    </>
  );
}
