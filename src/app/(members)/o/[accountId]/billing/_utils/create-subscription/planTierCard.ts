import type { AvailableBillingTier, SubscriptionTierCategory } from "@/types/api/account";

/** Responsive grid columns for Step 1 tier comparison (mobile always single column). */
export function planTierGridColumnClass(tierCount: number): string {
  if (tierCount <= 1) return "grid-cols-1";
  if (tierCount === 2) return "grid-cols-1 md:grid-cols-2";
  if (tierCount === 3) return "grid-cols-1 md:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}

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
