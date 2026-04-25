import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type {
  SeasonHubCompetitionDetailResponse,
  SeasonHubCompetitionListResponse,
  SeasonHubCompetitionsListParams,
  SeasonHubFixtureDetailResponse,
  SeasonHubGradeDetailResponse,
  SeasonHubGradeFixturesListResponse,
  SeasonHubGradesListResponse,
  SeasonHubReconResponse,
  SeasonHubStatsResponse,
} from "@/types/api/season-hub";

function base(accountId: string) {
  return `${appRoutes.seasonHub.base.path}/${encodeURIComponent(accountId)}`;
}

/**
 * Season hub read model (GET /api/season-hub/:accountId/… via BFF).
 * @see src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md
 */
export const seasonHubApi = {
  getRecon: (accountId: string) =>
    apiClient.get<SeasonHubReconResponse>(`${base(accountId)}/recon`),

  getStats: (accountId: string) =>
    apiClient.get<SeasonHubStatsResponse>(`${base(accountId)}/stats`),

  getCompetitions: (accountId: string, params?: SeasonHubCompetitionsListParams) => {
    const search = new URLSearchParams();
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 25;
    search.set("page", String(page));
    search.set("pageSize", String(pageSize));
    const qs = search.toString();
    return apiClient.get<SeasonHubCompetitionListResponse>(`${base(accountId)}/competitions?${qs}`);
  },

  getCompetition: (accountId: string, competitionId: number | string) =>
    apiClient.get<SeasonHubCompetitionDetailResponse>(
      `${base(accountId)}/competitions/${encodeURIComponent(String(competitionId))}`,
    ),

  getCompetitionGrades: (accountId: string, competitionId: number | string) =>
    apiClient.get<SeasonHubGradesListResponse>(
      `${base(accountId)}/competitions/${encodeURIComponent(String(competitionId))}/grades`,
    ),

  /** Grade under competition context (canonical drill-down). */
  getGradeInCompetition: (
    accountId: string,
    competitionId: number | string,
    gradeId: number | string,
  ) =>
    apiClient.get<SeasonHubGradeDetailResponse>(
      `${base(accountId)}/competitions/${encodeURIComponent(String(competitionId))}/grades/${encodeURIComponent(String(gradeId))}`,
    ),

  getGradeFixturesInCompetition: (
    accountId: string,
    competitionId: number | string,
    gradeId: number | string,
  ) =>
    apiClient.get<SeasonHubGradeFixturesListResponse>(
      `${base(accountId)}/competitions/${encodeURIComponent(String(competitionId))}/grades/${encodeURIComponent(String(gradeId))}/fixtures`,
    ),

  getFixtureCanonical: (
    accountId: string,
    competitionId: number | string,
    gradeId: number | string,
    fixtureId: number | string,
  ) =>
    apiClient.get<SeasonHubFixtureDetailResponse>(
      `${base(accountId)}/competitions/${encodeURIComponent(String(competitionId))}/grades/${encodeURIComponent(String(gradeId))}/fixtures/${encodeURIComponent(String(fixtureId))}`,
    ),

  /** Alias: grade detail without competition in URL. */
  getGrade: (accountId: string, gradeId: number | string) =>
    apiClient.get<SeasonHubGradeDetailResponse>(
      `${base(accountId)}/grades/${encodeURIComponent(String(gradeId))}`,
    ),

  getGradeFixturesAlias: (accountId: string, gradeId: number | string) =>
    apiClient.get<SeasonHubGradeFixturesListResponse>(
      `${base(accountId)}/grades/${encodeURIComponent(String(gradeId))}/fixtures`,
    ),

  getFixtureAlias: (accountId: string, gradeId: number | string, fixtureId: number | string) =>
    apiClient.get<SeasonHubFixtureDetailResponse>(
      `${base(accountId)}/grades/${encodeURIComponent(String(gradeId))}/fixtures/${encodeURIComponent(String(fixtureId))}`,
    ),
};
