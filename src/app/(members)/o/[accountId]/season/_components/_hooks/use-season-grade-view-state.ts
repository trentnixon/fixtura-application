"use client";

import { useMemo } from "react";

import {
  asRecord,
  buildSeasonGradeDisplayModel,
  getFixturesCountFromGrade,
  resolveGradeTitle,
} from "../_utils";

import type { UnknownRecord } from "../_types";

type UseSeasonGradeViewStateArgs<RowType> = {
  grade: unknown;
  gradeId: string;
  competitionId: string;
  fixturesRows: RowType[];
  fixturesPending: boolean;
};

export function useSeasonGradeViewState<RowType>({
  grade,
  gradeId,
  competitionId,
  fixturesRows,
  fixturesPending,
}: UseSeasonGradeViewStateArgs<RowType>) {
  const title = resolveGradeTitle(grade, gradeId);
  const fixturesCountFromGrade = getFixturesCountFromGrade(grade);
  const fixturesEmpty = !fixturesPending && fixturesRows.length === 0;

  const gradeRaw = useMemo((): UnknownRecord | undefined => asRecord(grade), [grade]);

  const displayModel = useMemo(
    () =>
      buildSeasonGradeDisplayModel({
        gradeRaw,
        gradeId,
        competitionId,
        fixtureRowCount: fixturesRows.length,
      }),
    [gradeRaw, gradeId, competitionId, fixturesRows.length],
  );

  return {
    title,
    fixturesCountFromGrade,
    fixturesEmpty,
    gradeRaw,
    displayModel,
  };
}
