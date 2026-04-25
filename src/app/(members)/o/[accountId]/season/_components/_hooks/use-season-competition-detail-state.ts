import { getGradesCountFromCompetition, resolveCompetitionTitle } from "../_utils";

import type { UnknownRecord } from "../_types";

type UseSeasonCompetitionDetailStateArgs = {
  competitionRaw: unknown;
  competitionId: string;
  gradesData: unknown;
  gradesPending: boolean;
};

export function useSeasonCompetitionDetailState({
  competitionRaw,
  competitionId,
  gradesData,
  gradesPending,
}: UseSeasonCompetitionDetailStateArgs) {
  const raw =
    competitionRaw && typeof competitionRaw === "object"
      ? (competitionRaw as UnknownRecord)
      : undefined;
  const title = resolveCompetitionTitle(raw, competitionId);

  const gradeRows = Array.isArray(gradesData) ? (gradesData as UnknownRecord[]) : [];
  const gradesCountFromDetail = getGradesCountFromCompetition(raw);
  const gradesEmpty = !gradesPending && gradeRows.length === 0;

  return {
    title,
    gradeRows,
    gradesCountFromDetail,
    gradesEmpty,
  };
}
