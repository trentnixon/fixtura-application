"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountSponsorAllocationsGeneral } from "@/lib/api/hooks/account/useAccountSponsorAllocationsGeneral";

import { SelectedSponsorPlacementSummary } from "./_components/selected-sponsor-placement-summary";
import { SponsorPlacementOptionsCard } from "./_components/sponsor-placement-options-card";
import { SponsorPlacementSummaryCard } from "./_components/sponsor-placement-summary-card";
import { SPONSOR_TARGETING_PANEL_COPY } from "./_constants/sponsor-targeting-panel";
import { allocationKind } from "./_utils/sponsor-targeting";

import type { SponsorTargetingPanelProps } from "./_types/sponsor-targeting";

export function SponsorTargetingPanel({ accountId, sponsor }: SponsorTargetingPanelProps) {
  const sponsorNumericId =
    sponsor != null && typeof sponsor.id === "number" && sponsor.id > 0 ? sponsor.id : null;

  const generalQuery = useAccountSponsorAllocationsGeneral(accountId, sponsorNumericId, {
    enabled: sponsorNumericId != null,
  });

  const positionPlacements =
    sponsor?.sponsorshipAllocations.filter((row) => allocationKind(row.allocation) === "general") ??
    [];

  const entityPlacements =
    sponsor?.sponsorshipAllocations.filter((row) => allocationKind(row.allocation) === "entity") ??
    [];

  const refreshedPositionCount = generalQuery.data?.data.items.length ?? null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{SPONSOR_TARGETING_PANEL_COPY.title}</CardTitle>
        <CardDescription>{SPONSOR_TARGETING_PANEL_COPY.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <SponsorPlacementOptionsCard
          title={SPONSOR_TARGETING_PANEL_COPY.optionsTitle}
          description={SPONSOR_TARGETING_PANEL_COPY.optionsDescription}
          positionBadge={SPONSOR_TARGETING_PANEL_COPY.positionBadge}
          entityBadge={SPONSOR_TARGETING_PANEL_COPY.entityBadge}
        />

        {!sponsor ? (
          <p className="text-muted-foreground">{SPONSOR_TARGETING_PANEL_COPY.noSponsor}</p>
        ) : (
          <>
            <SelectedSponsorPlacementSummary
              sponsor={sponsor}
              refreshedPositionCount={refreshedPositionCount}
              isRefreshing={generalQuery.isFetching}
              refreshError={generalQuery.isError ? generalQuery.error : null}
            />

            <SponsorPlacementSummaryCard
              title={SPONSOR_TARGETING_PANEL_COPY.positionSummaryTitle}
              count={positionPlacements.length}
              emptyLabel={SPONSOR_TARGETING_PANEL_COPY.noPositionPlacements}
            />

            <SponsorPlacementSummaryCard
              title={SPONSOR_TARGETING_PANEL_COPY.entitySummaryTitle}
              count={entityPlacements.length}
              emptyLabel={SPONSOR_TARGETING_PANEL_COPY.noEntityPlacements}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
