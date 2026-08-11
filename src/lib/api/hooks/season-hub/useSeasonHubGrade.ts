import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { seasonHubApi } from "../../services/season-hub.api";

export function useSeasonHubGrade(
  accountId: string,
  gradeId: string,
  options?: { competitionId?: string; enabled?: boolean },
) {
  const competitionId = options?.competitionId;
  const useCanonical = typeof competitionId === "string" && competitionId.length > 0;
  const enabled = options?.enabled ?? Boolean(accountId && gradeId);
  return useQuery({
    queryKey: queryKeys.seasonHub.grade(accountId, gradeId, useCanonical ? competitionId : null),
    queryFn: () =>
      useCanonical
        ? seasonHubApi.getGradeInCompetition(accountId, competitionId, gradeId)
        : seasonHubApi.getGrade(accountId, gradeId),
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
