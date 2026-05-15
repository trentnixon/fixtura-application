"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountSponsorAllocationsGeneral } from "@/lib/api/hooks/account/useAccountSponsorAllocationsGeneral";

import { parseGeneralAccountGroup } from "../../_utils/sponsorship-allocation-general";

import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";

function allocationKind(allocation: unknown): "general" | "entity" | "unknown" {
  if (!allocation || typeof allocation !== "object") return "unknown";
  const o = allocation as Record<string, unknown>;
  if (parseGeneralAccountGroup(allocation)) return "general";
  if (o["entity"] != null && typeof o["entity"] === "object") return "entity";
  return "unknown";
}

function placementCountLabel(count: number): string {
  return `${count} placement${count === 1 ? "" : "s"}`;
}

export function SponsorTargetingPanel({
  accountId,
  sponsor,
}: {
  accountId: string;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
}) {
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
        <CardTitle>Where this sponsor appears</CardTitle>
        <CardDescription>
          See whether this sponsor is assigned to account-wide positions or specific clubs, teams,
          and grades.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="grid gap-2 rounded-xl border border-dashed p-4">
          <p className="font-medium">Placement options</p>
          <p className="text-muted-foreground">
            Use Assign sponsors to choose account-wide positions, or assign sponsors directly to
            clubs, teams, and grades.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Position placements</Badge>
            <Badge variant="outline">Club, team, and grade placements</Badge>
          </div>
        </div>

        {!sponsor ? (
          <p className="text-muted-foreground">
            Choose a sponsor from the pool to review placements.
          </p>
        ) : (
          <>
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
                    - <span className="text-foreground font-medium">
                      {refreshedPositionCount}
                    </span>{" "}
                    account-wide position{refreshedPositionCount === 1 ? "" : "s"}
                  </>
                ) : null}
              </p>
              {generalQuery.isError ? (
                <p className="text-destructive text-xs">
                  Could not refresh account-wide placements (
                  {generalQuery.error instanceof Error
                    ? generalQuery.error.message
                    : "Request failed"}
                  ).
                </p>
              ) : null}
              {generalQuery.isFetching ? (
                <p className="text-muted-foreground text-xs">Loading account-wide placements...</p>
              ) : null}
            </div>

            <div className="grid gap-2 rounded-xl border p-4">
              <p className="font-medium">Account-wide positions</p>
              <p className="text-muted-foreground text-xs">
                {positionPlacements.length === 0
                  ? "No account-wide positions assigned."
                  : placementCountLabel(positionPlacements.length)}
              </p>
            </div>

            <div className="grid gap-2 rounded-xl border p-4">
              <p className="font-medium">Club, team, and grade placements</p>
              <p className="text-muted-foreground text-xs">
                {entityPlacements.length === 0
                  ? "No club, team, or grade placements assigned."
                  : placementCountLabel(entityPlacements.length)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
