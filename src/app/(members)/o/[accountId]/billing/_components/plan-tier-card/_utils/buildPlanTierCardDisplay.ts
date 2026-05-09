import { formatMoney } from "../../../_utils/overview/formatBillingDisplay";
import {
  PLAN_TIER_CARD_DESCRIPTION_MAX_LENGTH,
  PLAN_TIER_CARD_LABELS,
  PLAN_TIER_CARD_SEPARATOR,
} from "../_constants/planTierCard";

import type { AvailableBillingTier } from "@/types/api/account";

export type PlanTierCardDisplay = {
  description: string | null;
  metaLine: string | null;
  price: string;
  sponsorAssetLine: string | null;
  weekly: string | null;
};

export function buildPlanTierCardDisplay(tier: AvailableBillingTier): PlanTierCardDisplay {
  const coverageLabel =
    tier.daysInPass > 0 ? `${tier.daysInPass} ${PLAN_TIER_CARD_LABELS.daysCovered}` : null;
  const assetLine =
    tier.includedAssetTypes.length > 0
      ? tier.includedAssetTypes.join(PLAN_TIER_CARD_SEPARATOR)
      : null;
  const sponsorAssetLine = [
    tier.includeSponsors ? PLAN_TIER_CARD_LABELS.sponsorsIncluded : null,
    assetLine,
  ]
    .filter(Boolean)
    .join(PLAN_TIER_CARD_SEPARATOR);

  return {
    description: truncateBillingTierDescription(tier.description),
    metaLine: [coverageLabel].filter(Boolean).join(PLAN_TIER_CARD_SEPARATOR) || null,
    price: formatMoney(tier.price, tier.currency),
    sponsorAssetLine: sponsorAssetLine || null,
    weekly:
      tier.priceByWeekInPass != null
        ? `${formatMoney(tier.priceByWeekInPass, tier.currency)}/week`
        : null,
  };
}

export function selectBillingTierPlanButtonLabel(tierName: string): string {
  const planPhrase = tierName.replace(/\s+pass$/i, " plan");
  return `Select ${planPhrase}`;
}

function truncateBillingTierDescription(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length <= PLAN_TIER_CARD_DESCRIPTION_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, PLAN_TIER_CARD_DESCRIPTION_MAX_LENGTH - 3)}...`;
}
