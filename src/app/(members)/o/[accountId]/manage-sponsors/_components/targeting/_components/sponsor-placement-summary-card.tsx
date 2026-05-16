import { placementCountLabel } from "../_utils/sponsor-targeting";

import type { SponsorPlacementSummaryCardProps } from "../_types/sponsor-targeting";

export function SponsorPlacementSummaryCard({
  title,
  count,
  emptyLabel,
}: SponsorPlacementSummaryCardProps) {
  return (
    <div className="grid gap-2 rounded-xl border p-4">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">
        {count === 0 ? emptyLabel : placementCountLabel(count)}
      </p>
    </div>
  );
}
