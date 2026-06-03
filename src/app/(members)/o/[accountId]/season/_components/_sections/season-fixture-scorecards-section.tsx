"use client";

import { SectionBlock, SectionDivider } from "@/components/ui/section";

import { SeasonFixtureScorecardTable } from "./season-fixture-scorecard-table";

import type { SeasonFixtureScorecardsSectionProps } from "../_types";

export function SeasonFixtureScorecardsSection({ model }: SeasonFixtureScorecardsSectionProps) {
  if (!model.showScorecardSection) {
    return null;
  }

  const hasTables = model.inningsScorecards.some(
    (innings) => innings.battingRows.length > 0 || innings.bowlingRows.length > 0,
  );

  if (!hasTables) {
    return null;
  }

  return (
    <>
      <SectionDivider variant="labeled" label="Scorecard" />
      <SectionBlock variant="inset" spacing="sm">
        <div className="grid gap-8">
          {model.inningsScorecards.map((innings) => {
            const showBatting = innings.battingRows.length > 0;
            const showBowling = innings.bowlingRows.length > 0;
            if (!showBatting && !showBowling) {
              return null;
            }
            return (
              <div key={innings.key} className="grid gap-6">
                {showBatting ? (
                  <SeasonFixtureScorecardTable
                    title={innings.battingTitle}
                    headers={innings.battingHeaders}
                    rows={innings.battingRows}
                  />
                ) : null}
                {showBowling ? (
                  <SeasonFixtureScorecardTable
                    title={innings.bowlingTitle}
                    headers={innings.bowlingHeaders}
                    rows={innings.bowlingRows}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </SectionBlock>
    </>
  );
}
