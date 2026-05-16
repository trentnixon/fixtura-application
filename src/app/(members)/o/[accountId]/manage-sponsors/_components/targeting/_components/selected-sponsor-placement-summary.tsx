import { SPONSOR_TARGETING_PANEL_COPY } from "../_constants/sponsor-targeting-panel";
import { accountWidePositionLabel, placementCountLabel } from "../_utils/sponsor-targeting";

import type { SelectedSponsorPlacementSummaryProps } from "../_types/sponsor-targeting";

export function SelectedSponsorPlacementSummary({
  sponsor,
  refreshedPositionCount,
  isRefreshing,
  refreshError,
}: SelectedSponsorPlacementSummaryProps) {
  return (
    <div className="grid gap-2 rounded-xl border p-4">
      <p className="font-medium">{sponsor.name}</p>
      <p className="text-muted-foreground">
        <span className="text-foreground font-medium">
          {placementCountLabel(sponsor.allocationCount)}
        </span>{" "}
        assigned
        {refreshedPositionCount != null ? (
          <>
            {" "}
            - <span className="text-foreground font-medium">{refreshedPositionCount}</span>{" "}
            {accountWidePositionLabel(refreshedPositionCount)}
          </>
        ) : null}
      </p>
      {refreshError ? (
        <p className="text-destructive text-xs">
          {SPONSOR_TARGETING_PANEL_COPY.refreshErrorPrefix} (
          {refreshError instanceof Error
            ? refreshError.message
            : SPONSOR_TARGETING_PANEL_COPY.refreshErrorFallback}
          ).
        </p>
      ) : null}
      {isRefreshing ? (
        <p className="text-muted-foreground text-xs">
          {SPONSOR_TARGETING_PANEL_COPY.refreshLoading}
        </p>
      ) : null}
    </div>
  );
}
