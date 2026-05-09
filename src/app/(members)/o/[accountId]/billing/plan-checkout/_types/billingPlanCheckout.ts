import type { AvailableBillingTier } from "@/types/api/account";

export type BillingPlanCheckoutProps = {
  accountId: string;
  /** Mirrors billing summary segment gate. */
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

/** Single tier option button for `BillingPlanCheckoutFormTierRadios`. */
export type BillingPlanCheckoutFormTierRadioOptionProps = {
  tier: AvailableBillingTier;
  selected: boolean;
  onSelect: () => void;
};

/** Tier selection radiogroup for `BillingPlanCheckoutForm`. */
export type BillingPlanCheckoutFormTierRadiosProps = {
  tiers: AvailableBillingTier[];
  selectedTierId: string | null;
  onSelectTierId: (tierId: string) => void;
};

/** Presentational plan tier list, start date, and checkout CTA for `BillingPlanCheckout`. */
export type BillingPlanCheckoutFormProps = {
  tiers: AvailableBillingTier[];
  minDate: string;
  selectedTierId: string | null;
  onSelectTierId: (tierId: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  checkoutError: string | null;
  missingCheckoutUrl: boolean;
  canSubmit: boolean;
  isCheckoutPending: boolean;
  onContinueToPayment: () => void;
};
