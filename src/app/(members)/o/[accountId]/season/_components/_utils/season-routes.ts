import { accountScopedRoutes } from "@/lib/config/account-routes";

export function buildSeasonOverviewHref(accountId: string): string {
  return accountScopedRoutes.season(accountId);
}

export function buildSeasonCompetitionHref(
  accountId: string,
  competitionId: string | number,
): string {
  return `${buildSeasonOverviewHref(accountId)}/competitions/${competitionId}`;
}

export function buildSeasonGradeHref(
  accountId: string,
  competitionId: string | number,
  gradeId: string | number,
): string {
  return `${buildSeasonCompetitionHref(accountId, competitionId)}/grades/${gradeId}`;
}

export function buildSeasonFixtureHref(
  accountId: string,
  competitionId: string | number,
  gradeId: string | number,
  fixtureId: string | number,
): string {
  return `${buildSeasonGradeHref(accountId, competitionId, gradeId)}/fixtures/${fixtureId}`;
}
