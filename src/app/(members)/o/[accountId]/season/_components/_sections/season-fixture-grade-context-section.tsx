"use client";

import { BadgeInfo, Trophy, UsersRound } from "lucide-react";

import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureGradeContextSectionProps } from "../_types";

export function SeasonFixtureGradeContextSection({ model }: SeasonFixtureGradeContextSectionProps) {
  const profile = [model.gradeGender, model.gradeAgeGroup].filter(Boolean).join(" - ");

  return (
    <>
      <SectionDivider variant="labeled" label="Grade context" />
      <SectionBlock variant="inset" spacing="sm">
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Surface className="bg-background/80 ring-border min-h-24 rounded-lg p-4 shadow-none ring-1">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <Trophy className="size-4" aria-hidden />
                Competition
              </dt>
              <dd className="mt-2 text-sm font-semibold break-words">{model.competitionName}</dd>
            </Surface>
            <Surface className="bg-background/80 ring-border min-h-24 rounded-lg p-4 shadow-none ring-1">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <UsersRound className="size-4" aria-hidden />
                Grade
              </dt>
              <dd className="mt-2 text-sm font-semibold break-words">{model.gradeName}</dd>
              {profile ? <dd className="text-muted-foreground mt-1 text-xs">{profile}</dd> : null}
            </Surface>
            <Surface className="bg-background/80 ring-border min-h-24 rounded-lg p-4 shadow-none ring-1">
              <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <BadgeInfo className="size-4" aria-hidden />
                Association
              </dt>
              <dd className="mt-2 text-sm font-semibold break-words">
                {model.associationName ?? "-"}
              </dd>
            </Surface>
          </dl>
        </div>
      </SectionBlock>
    </>
  );
}
