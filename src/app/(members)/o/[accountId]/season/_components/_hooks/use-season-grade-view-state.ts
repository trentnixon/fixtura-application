import { getFixturesCountFromGrade, resolveGradeTitle } from "../_utils";

type UseSeasonGradeViewStateArgs<RowType> = {
  grade: unknown;
  gradeId: string;
  fixturesRows: RowType[];
  fixturesPending: boolean;
};

export function useSeasonGradeViewState<RowType>({
  grade,
  gradeId,
  fixturesRows,
  fixturesPending,
}: UseSeasonGradeViewStateArgs<RowType>) {
  const title = resolveGradeTitle(grade, gradeId);
  const fixturesCountFromGrade = getFixturesCountFromGrade(grade);
  const fixturesEmpty = !fixturesPending && fixturesRows.length === 0;

  return {
    title,
    fixturesCountFromGrade,
    fixturesEmpty,
  };
}
