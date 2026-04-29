"use client";

import { useMemo } from "react";

import { buildSeasonFixtureViewModel } from "../_utils/season-fixture-view-model";

export function useSeasonFixtureViewModel(
  payload: unknown,
  gradeId: string,
  fixtureId: string,
  competitionId: string,
) {
  return useMemo(
    () => buildSeasonFixtureViewModel(payload, { gradeId, fixtureId, competitionId }),
    [payload, gradeId, fixtureId, competitionId],
  );
}
