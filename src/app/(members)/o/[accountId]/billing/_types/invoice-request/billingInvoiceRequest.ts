import type { AvailableBillingTier } from "@/types/api/account";

/** Tier selection radiogroup for `BillingInvoiceRequestForm`. */
export type BillingInvoiceRequestFormTierRadiosProps = {
  tiers: AvailableBillingTier[];
  selectedTierId: string | null;
  onSelectTierId: (tierId: string) => void;
};

export type BillingInvoiceRequestFormTierRadioOptionProps = {
  tier: AvailableBillingTier;
  selected: boolean;
  onSelect: () => void;
};

export type BillingInvoiceRequestProps = {
  accountId: string;
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

export type BillingInvoiceRequestBodyFields = {
  selectedTierId: string;
  startParsed: Date;
  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
  notes: string;
};

/** Presentational form section for `BillingInvoiceRequest` (tiers + fields + submit). */
export type BillingInvoiceRequestFormProps = {
  tiers: AvailableBillingTier[];
  submitSuccessMessage: string | null;
  selectedTierId: string | null;
  onSelectTierId: (tierId: string) => void;
  requestedStartLocal: string;
  onRequestedStartLocalChange: (value: string) => void;
  billingContactName: string;
  onBillingContactNameChange: (value: string) => void;
  billingEmail: string;
  onBillingEmailChange: (value: string) => void;
  billingOrganisationName: string;
  onBillingOrganisationNameChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  submitError: string | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
};
