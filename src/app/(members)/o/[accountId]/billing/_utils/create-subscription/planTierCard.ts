import type { AvailableBillingTier, SubscriptionTierCategory } from "@/types/api/account";

export function orderedDistinctSubscriptionCategories(
  tiers: AvailableBillingTier[],
): SubscriptionTierCategory[] {
  const seen = new Set<string>();
  const out: SubscriptionTierCategory[] = [];
  for (const t of tiers) {
    if (!seen.has(t.category)) {
      seen.add(t.category);
      out.push(t.category);
    }
  }
  return out;
}
