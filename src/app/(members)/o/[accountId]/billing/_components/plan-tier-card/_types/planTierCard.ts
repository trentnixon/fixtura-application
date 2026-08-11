import type { AvailableBillingTier } from "@/types/api/account";

export type PlanTierCardProps = {
  tier: AvailableBillingTier;
  selected: boolean;
  onSelect: () => void;
};
