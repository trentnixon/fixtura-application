"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionBlock, SectionDivider } from "@/components/ui/section";

import type { SeasonFixtureGradeContextSectionProps } from "../_types";

export function SeasonFixtureGradeContextSection({
  model,
  gradeHref,
}: SeasonFixtureGradeContextSectionProps) {
  return (
    <>
      <SectionDivider variant="labeled" label="Grade context" />
      <SectionBlock variant="inset" spacing="sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold">Grade context</p>
            <p className="text-muted-foreground text-xs">
              Competition-scoped grade for this fixture.
            </p>
            <dl className="text-muted-foreground mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase">Grade</dt>
                <dd className="text-foreground font-medium">{model.gradeName}</dd>
              </div>
              {(model.gradeGender || model.gradeAgeGroup) && (
                <div>
                  <dt className="text-xs font-medium uppercase">Profile</dt>
                  <dd>{[model.gradeGender, model.gradeAgeGroup].filter(Boolean).join(" - ")}</dd>
                </div>
              )}
              {model.associationName ? (
                <div>
                  <dt className="text-xs font-medium uppercase">Association</dt>
                  <dd>{model.associationName}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <Button variant="outline" asChild className="shrink-0 self-start">
            <Link href={gradeHref}>Back to grade</Link>
          </Button>
        </div>
      </SectionBlock>
    </>
  );
}
