import { PLAN_TIER_CARD_LABELS } from "../_constants/planTierCard";

import type { AvailableBillingTier } from "@/types/api/account";

export type PlanTierCardDisplay = {
  metaLine: string | null;
  price: string;
  weekly: string | null;
};

function formatPlanTierDollarAmount(amount: number): string {
  const amountLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `$${amountLabel}`;
}

/** Hero total on tier cards: `$200.00 (aud)` — not locale currency prefix. */
export function formatPlanTierMainPrice(amount: number, currency: string | null): string {
  const code = (currency?.trim() || "AUD").toLowerCase();
  return `${formatPlanTierDollarAmount(amount)} (${code})`;
}

export function buildPlanTierCardDisplay(tier: AvailableBillingTier): PlanTierCardDisplay {
  const coverageLabel =
    tier.daysInPass > 0 ? `${tier.daysInPass} ${PLAN_TIER_CARD_LABELS.daysCovered}` : null;

  return {
    metaLine: coverageLabel,
    price: formatPlanTierMainPrice(tier.price, tier.currency),
    weekly:
      tier.priceByWeekInPass != null
        ? `${formatPlanTierDollarAmount(tier.priceByWeekInPass)}/week`
        : null,
  };
}

export function selectBillingTierPlanButtonLabel(tierName: string): string {
  const planPhrase = tierName.replace(/\s+pass$/i, " plan");
  return `Select ${planPhrase}`;
}
