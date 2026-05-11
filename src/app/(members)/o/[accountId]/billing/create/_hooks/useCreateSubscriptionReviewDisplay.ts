import { useMemo } from "react";

import { buildCreateSubscriptionReviewDisplay } from "../_utils/createSubscriptionWizardDisplay";

import type { PaymentPath } from "../_types/createSubscriptionWizard";
import type { AvailableBillingTier } from "@/types/api/account";

export function useCreateSubscriptionReviewDisplay({
  selectedTier,
  selectedTierId,
  paymentPath,
}: {
  selectedTier: AvailableBillingTier | undefined;
  selectedTierId: string | null;
  paymentPath: PaymentPath | null;
}) {
  return useMemo(
    () => buildCreateSubscriptionReviewDisplay({ selectedTier, selectedTierId, paymentPath }),
    [paymentPath, selectedTier, selectedTierId],
  );
}
