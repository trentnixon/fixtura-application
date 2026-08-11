"use client";

import { Button } from "@/components/ui/button";

import { SeasonEmptyPanel } from "../season-empty-panel";

import type { SeasonOverviewEmptyStatesProps } from "../_types";

export function SeasonOverviewEmptyStates({
  reconPresent,
  allResourceZeros,
  competitionsUnavailable,
  listEmptyButScopeShowsCompetitions,
  onRefetchCompetitions,
}: SeasonOverviewEmptyStatesProps) {
  return (
    <>
      {reconPresent && allResourceZeros && !competitionsUnavailable ? (
        <SeasonEmptyPanel
          title="Nothing to show yet"
          description="Counts are all zero: no competitions, grades, teams, or fixtures are in scope for this account. When your administrator links competitions and fixtures, they will show up here."
        />
      ) : null}

      {listEmptyButScopeShowsCompetitions ? (
        <SeasonEmptyPanel
          title="No competitions in this list"
          description="Recon reports competitions for this account, but the list endpoint returned none. You can refresh the list, or try again after the next data sync."
          footer={
            <Button type="button" variant="outline" size="sm" onClick={onRefetchCompetitions}>
              Refresh list
            </Button>
          }
        />
      ) : null}
    </>
  );
}
