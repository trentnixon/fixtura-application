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

/** Scorecard table rows from PlayHQ-style payloads (column count varies). */
export type SeasonHubScorecardRow = string[];

export interface SeasonHubFixtureTeamScores {
  total: string | null;
  overs: string | null;
  firstInnings: string | null;
}

export interface SeasonHubFixtureTeamSide {
  name: string;
  scores?: SeasonHubFixtureTeamScores;
}

export interface SeasonHubFixtureDates {
  dayOne?: string | null;
  finalDaysPlay?: string | null;
  date?: string | null;
  time?: string | null;
  dateRange?: string | null;
  dateRangeObj?: string[];
}

export interface SeasonHubFixtureVenue {
  ground?: string | null;
}

export interface SeasonHubFixtureFieldersBlock {
  headers: string[];
  fieldersData: unknown[];
}

export interface SeasonHubFixtureInningsScorecard {
  FOW: unknown[];
  battingRows: SeasonHubScorecardRow[];
  bowlingRows: SeasonHubScorecardRow[];
  fieldersData: SeasonHubFixtureFieldersBlock;
  Battingheaders: string[];
  Bowlingheaders: string[];
  BattinginningsName: string;
  BowlinginningsName: string;
}

export interface SeasonHubFixtureMatchDetails {
  tossWinner?: string | null;
  tossResult?: string | null;
  urlToScoreCard?: string | null;
  scorecards?: {
    innings1?: SeasonHubFixtureInningsScorecard;
    innings2?: SeasonHubFixtureInningsScorecard;
    [key: string]: SeasonHubFixtureInningsScorecard | undefined;
  };
  resultStatement?: string | null;
}

export interface SeasonHubFixtureContent {
  gameContext?: string | null;
  basePromptInformation?: string | null;
  hasBasePrompt?: boolean;
  upcomingFixturePrompt?: string | null;
  hasUpcomingFixturePrompt?: boolean;
  lastPromptUpdate?: string | null;
}

/** Primary match object inside fixture detail. */
export interface SeasonHubFixtureDetailFixture {
  id: number;
  gameID?: string | null;
  gameId?: string | null;
  /** Flattened list/detail alias when `dates` is absent. */
  date?: string | null;
  title?: string | null;
  name?: string | null;
  round?: string | null;
  status?: string | null;
  type?: string | null;
  isFinished?: boolean;
  dates?: SeasonHubFixtureDates;
  venue?: SeasonHubFixtureVenue;
  teams?: {
    home?: SeasonHubFixtureTeamSide;
    away?: SeasonHubFixtureTeamSide;
  };
  matchDetails?: SeasonHubFixtureMatchDetails;
  content?: SeasonHubFixtureContent;
  teamRoster?: unknown | null;
}

export interface SeasonHubFixtureDetailAssociation {
  id: number;
  name: string | null;
  href?: string | null;
  logo?: string | null;
}

export interface SeasonHubFixtureDetailCompetitionRef {
  id: number;
  name: string | null;
}

export interface SeasonHubFixtureDetailGrade {
  id: number;
  gradeName?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  association?: SeasonHubFixtureDetailAssociation;
  competition?: SeasonHubFixtureDetailCompetitionRef;
}

export interface SeasonHubFixtureDetailTeamRef {
  id: number;
  name: string;
  logoUrl?: string | null;
}

export interface SeasonHubFixtureRenderEntry {
  id: number;
  status: string;
  processedAt?: string | null;
}

export interface SeasonHubFixtureRenderStatus {
  upcomingGamesRenders?: SeasonHubFixtureRenderEntry[];
  gameResultsRenders?: SeasonHubFixtureRenderEntry[];
}

export interface SeasonHubFixtureDetailValidation {
  overallScore?: number;
  status?: string;
  statusBased?: boolean;
  breakdown?: Record<string, number>;
  missingFields?: unknown[];
  recommendations?: unknown[];
}

export interface SeasonHubFixtureDetailMeta {
  generatedAt?: string;
  fixtureId?: number;
  validation?: SeasonHubFixtureDetailValidation;
  performance?: {
    fetchTimeMs?: number;
    processingTimeMs?: number;
    totalTimeMs?: number;
  };
}

export interface SeasonHubFixtureDetailContext {
  admin?: {
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    lastPromptUpdate?: string | null;
  };
}

export interface SeasonHubFixtureDetailLinks {
  canonical: string;
  alias: string;
}

export interface SeasonHubFixtureDownloadRef {
  label?: string;
  href?: string;
  url?: string;
  [key: string]: unknown;
}

export type SeasonHubFixtureDetailTeamsData =
  | SeasonHubFixtureDetailTeamRef[]
  | {
      home?: SeasonHubFixtureDetailTeamRef;
      away?: SeasonHubFixtureDetailTeamRef;
      teams?: {
        home?: SeasonHubFixtureDetailTeamRef;
        away?: SeasonHubFixtureDetailTeamRef;
      };
    };

/** Unwrapped body: sibling keys under `json` / `data`. */
export interface SeasonHubFixtureDetailBody {
  fixture: SeasonHubFixtureDetailFixture;
  grade: SeasonHubFixtureDetailGrade;
  teamsData: SeasonHubFixtureDetailTeamsData;
  downloads: SeasonHubFixtureDownloadRef[];
  renderStatus: SeasonHubFixtureRenderStatus;
  club: SeasonHubFixtureDetailTeamRef[];
  context: SeasonHubFixtureDetailContext;
  meta: SeasonHubFixtureDetailMeta;
  links: SeasonHubFixtureDetailLinks;
}

export type SeasonHubFixtureDetailResponse =
  | { json: SeasonHubFixtureDetailBody }
  | { data: SeasonHubFixtureDetailBody }
  | SeasonHubFixtureDetailBody;

export function isSeasonHubFixtureDetailBody(value: unknown): value is SeasonHubFixtureDetailBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const rec = value as Record<string, unknown>;
  const fixture = rec["fixture"];
  if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
    return false;
  }
  const fixtureRec = fixture as Record<string, unknown>;
  if (typeof fixtureRec["id"] !== "number") {
    return false;
  }
  return (
    (rec["grade"] != null && typeof rec["grade"] === "object") ||
    Array.isArray(rec["teamsData"]) ||
    (rec["teamsData"] != null && typeof rec["teamsData"] === "object") ||
    (rec["renderStatus"] != null && typeof rec["renderStatus"] === "object") ||
    (rec["links"] != null && typeof rec["links"] === "object")
  );
}
