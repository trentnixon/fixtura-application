import { Badge } from "@/components/ui/badge";

import type { SponsorPlacementOptionsCardProps } from "../_types/sponsor-targeting";

export function SponsorPlacementOptionsCard({
  title,
  description,
  positionBadge,
  entityBadge,
}: SponsorPlacementOptionsCardProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-dashed p-4">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{positionBadge}</Badge>
        <Badge variant="outline">{entityBadge}</Badge>
      </div>
    </div>
  );
}
