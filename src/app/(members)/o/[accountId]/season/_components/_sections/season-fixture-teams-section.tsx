"use client";

import { Users } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureTeamsSectionProps } from "../_types";

export function SeasonFixtureTeamsSection({ model }: SeasonFixtureTeamsSectionProps) {
  return (
    <>
      <SectionDivider variant="labeled" label="Teams" />
      <SectionBlock variant="inset" spacing="sm">
        {model.teamSides ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["Home", model.teamSides.home],
                ["Away", model.teamSides.away],
              ] as const
            ).map(([label, side]) => (
              <Card key={label} className="gap-0 overflow-hidden p-0">
                <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                  <CardAction>
                    <Users className="size-5 text-white" aria-hidden />
                  </CardAction>
                  <p className="text-lg leading-none font-semibold text-white">{side.name}</p>
                  <p className="text-sm text-white/80">{label}</p>
                  {side.subtitle ? (
                    <p className="text-xs text-white/70">ID: {side.subtitle}</p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3 py-6">
                  {side.playerLines.length > 0 ? (
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      {side.playerLines.slice(0, 48).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                      {side.playerLines.length > 48 ? (
                        <li className="text-xs">+{side.playerLines.length - 48} more</li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">No player list in payload.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Surface className="flex min-h-16 items-center gap-3 py-4 shadow-none">
            <p className="text-muted-foreground text-sm">
              No structured teams data available for this fixture.
            </p>
          </Surface>
        )}
      </SectionBlock>
    </>
  );
}
