import { addDays, format, startOfDay } from "date-fns";

import type { PaymentPath } from "../_types/createSubscriptionWizard";
import type { AvailableBillingTier } from "@/types/api/account";

export type CreateSubscriptionReviewDisplay = {
  selectedTierName: string;
  selectedTierCoverage: string;
  paymentMethodLabel: string;
  paymentMethodDescription: string;
};

export function buildCreateSubscriptionReviewDisplay({
  selectedTier,
  selectedTierId,
  paymentPath,
}: {
  selectedTier: AvailableBillingTier | undefined;
  selectedTierId: string | null;
  paymentPath: PaymentPath | null;
}): CreateSubscriptionReviewDisplay {
  return {
    selectedTierName: selectedTier?.name ?? selectedTierId ?? "-",
    selectedTierCoverage:
      selectedTier && selectedTier.daysInPass > 0
        ? `${selectedTier.daysInPass} days in pass`
        : "Duration set by selected pass",
    paymentMethodLabel:
      paymentPath === "invoice" ? "Online invoice request" : "Card via Stripe Checkout",
    paymentMethodDescription:
      paymentPath === "invoice"
        ? "We will email the invoice and show it on your billing page."
        : "You will be redirected to Stripe to pay securely by card.",
  };
}

export type SelectedDateWindowDisplay = {
  daysInTierLabel: string;
  startDateLabel: string;
  endDateLabel: string;
};

export function buildSelectedDateWindowDisplay({
  selectedDate,
  daysInPass,
}: {
  selectedDate: Date | undefined;
  daysInPass: number | undefined;
}): SelectedDateWindowDisplay | null {
  if (!selectedDate) {
    return null;
  }

  const normalizedDays = Math.max(1, Math.floor(daysInPass ?? 0));
  const start = startOfDay(selectedDate);
  const end = addDays(start, normalizedDays - 1);

  return {
    daysInTierLabel: `${normalizedDays} ${normalizedDays === 1 ? "day" : "days"}`,
    startDateLabel: format(start, "PPP"),
    endDateLabel: format(end, "PPP"),
  };
}
