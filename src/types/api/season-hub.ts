/** @see src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md */

export type SeasonHubErrorCode =
  | "SEASON_HUB_AUTH_REQUIRED"
  | "SEASON_HUB_BAD_REQUEST"
  | "SEASON_HUB_NOT_FOUND"
  | "SEASON_HUB_INTERNAL_ERROR";

export interface SeasonHubErrorResponse {
  error: {
    code: SeasonHubErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SeasonHubReconResponse {
  data: {
    account: {
      id: number;
      sport: string | null;
      orgType: string | null;
    };
    scope: {
      clubIds: number[];
      associationIds: number[];
      competitionIds: number[];
      gradeIds: number[];
    };
    counts: {
      competitions: number;
      grades: number;
      teams: number;
      fixtures: number;
    };
    available: {
      stats: boolean;
      competitions: boolean;
      grades: boolean;
      teams: boolean;
      fixtures: boolean;
    };
    links: {
      stats: string;
      competitions: string;
    };
  };
}

export interface SeasonHubStatsResponse {
  data: {
    accountId: number;
    summary: {
      competitions: number;
      grades: number;
      teams: number;
      fixtures: number;
    };
    freshness?: {
      lastUpdatedAt?: string | null;
    };
  };
}

export interface SeasonHubCompetitionListItem {
  id: number;
  name: string;
  season: string | null;
  status: string | null;
  association: {
    id: number | null;
    name: string | null;
  };
  counts: {
    grades: number;
    teams: number;
    fixtures: number;
  };
  links: {
    self: string;
    grades: string;
  };
}

export interface SeasonHubCompetitionsListParams {
  page?: number;
  pageSize?: number;
}

export interface SeasonHubCompetitionListResponse {
  data: SeasonHubCompetitionListItem[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SeasonHubFixtureListItem {
  id: number;
  gameId: string | null;
  date: string | null;
  round: string | null;
  status: string | null;
  type: string | null;
  venue: {
    ground: string | null;
  };
  teams: {
    home: string | null;
    away: string | null;
  };
  grade: {
    id: number;
    name: string | null;
  };
  competition: {
    id: number | null;
    name: string | null;
  };
  association: {
    id: number | null;
    name: string | null;
  };
  links: {
    self: string;
    alias: string;
  };
}

/** Curated DTOs beyond list items — tighten when samples are fixed. */
export type SeasonHubCompetitionDetailResponse = { data: Record<string, unknown> };
export type SeasonHubGradesListResponse = { data: Record<string, unknown>[] };
export type SeasonHubGradeDetailResponse = { data: Record<string, unknown> };
export type SeasonHubGradeFixturesListResponse = { data: SeasonHubFixtureListItem[] };
export type SeasonHubFixtureDetailResponse = Record<string, unknown>;
