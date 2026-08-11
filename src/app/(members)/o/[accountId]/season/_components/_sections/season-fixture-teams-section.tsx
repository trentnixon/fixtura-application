"use client";

import { Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureTeamsSectionProps } from "../_types";

function TeamHeaderLogo({ logoUrl }: { logoUrl?: string | null | undefined }) {
  if (!logoUrl?.trim()) {
    return null;
  }
  return (
    <img
      src={logoUrl}
      alt=""
      className="size-8 shrink-0 rounded-full border border-white/20 object-cover"
    />
  );
}

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
            ).map(([label, side]) => {
              const logoUrl = label === "Home" ? model.homeLogoUrl : model.awayLogoUrl;
              return (
                <Card key={label} className="gap-0 overflow-hidden p-0">
                  <CardHeader className="bg-primary-950 border-b border-white/15 px-5 py-5 text-white">
                    <CardAction>
                      <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                        {side.playerLines.length} players
                      </Badge>
                    </CardAction>
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/65 uppercase">
                      <Shield className="size-4" aria-hidden />
                      {label}
                    </div>
                    <div className="flex items-center gap-3">
                      <TeamHeaderLogo logoUrl={logoUrl} />
                      <p className="text-xl leading-tight font-bold text-pretty text-white">
                        {side.name}
                      </p>
                    </div>
                    {side.subtitle ? (
                      <p className="text-xs text-white/70">ID: {side.subtitle}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3 py-5">
                    {side.playerLines.length > 0 ? (
                      <ul className="text-muted-foreground grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                        {side.playerLines.slice(0, 32).map((line, index) => (
                          <li key={`${line}-${index}`} className="truncate">
                            {line}
                          </li>
                        ))}
                        {side.playerLines.length > 32 ? (
                          <li className="text-xs">+{side.playerLines.length - 32} more</li>
                        ) : null}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No player list in payload.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Surface className="flex min-h-16 items-center gap-3 py-4 shadow-none">
            <Users className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <p className="text-muted-foreground text-sm">
              No structured teams data available for this fixture.
            </p>
          </Surface>
        )}
      </SectionBlock>
    </>
  );
}
