export const PLAN_TIER_CARD_LABELS = {
  daysCovered: "Days Covered",
  selected: "Selected",
} as const;

/** Outer card shell — neutral default; selected state applied separately. */
export const planTierCardShellBaseClass =
  "border-border bg-card hover:bg-muted/40 flex h-full cursor-pointer flex-col gap-0 pt-6 pb-0 text-left transition-[box-shadow,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const planTierCardShellSelectedClass = "border-primary bg-primary/5 ring-2 ring-primary";

export function planTierCardNameId(tierId: string): string {
  return `plan-tier-name-${tierId}`;
}
