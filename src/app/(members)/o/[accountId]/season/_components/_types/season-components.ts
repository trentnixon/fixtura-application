import type { ReactNode } from "react";

export type SeasonCompetitionDetailProps = {
  accountId: string;
  competitionId: string;
};

export type SeasonCompetitionDetailMeta = {
  season: string | undefined;
  status: string | undefined;
  isActive: boolean | undefined;
  timeframeStart: string | undefined;
  timeframeEnd: string | undefined;
  associationName: string | undefined;
};

export type SeasonCompetitionNormalizedGrade = {
  id: string;
  name: string;
  gender: string;
  ageGroup: string;
  teamCount: number;
  fixtureCount: number;
  status: string;
  competitionName?: string;
};

export type SeasonGradeViewProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
};

export type SeasonFixtureViewProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
  fixtureId: string;
};

export type SeasonOnboardingShellProps = {
  accountId: string;
  children: ReactNode;
};

export type SeasonEmptyPanelAction = {
  label: string;
  href: string;
};

export type SeasonEmptyPanelProps = {
  title: string;
  description: string;
  action?: SeasonEmptyPanelAction;
  footer?: ReactNode;
};

export type UnknownRecord = Record<string, unknown>;

export type CoverageFilter = "all" | "has-fixtures" | "no-fixtures" | "has-grades" | "no-grades";

export type SeasonOverviewCompetitionRow = {
  id: string | number;
  name: string | null;
  season: string | null;
  status: string | null;
  association: { name: string | null };
  counts: {
    grades: number;
    teams: number;
    fixtures: number;
  };
};

export type SeasonGradeDisplayModel = {
  competitionBreadcrumbLabel: string;
  displayName: string;
  status: string;
  teamCount: number;
  fixtureCount: number;
  headerContextLine: string | null;
  headerGradeMetaLine: string | null;
  gradeHeaderActive: boolean;
};

export type SeasonGradeFixtureFilterOptions = {
  teams: string[];
  venues: string[];
  dates: string[];
  statuses: Array<[string, string]>;
};

export type SeasonGradeFixtureFilterValues = {
  team: string;
  venue: string;
  date: string;
  status: string;
};

export type SeasonFixtureTeamSide = {
  name: string;
  subtitle?: string;
  playerLines: string[];
};

export type SeasonFixtureDownloadEntry = {
  label: string;
  href?: string;
};

export type SeasonFixtureContextMetaRow = {
  label: string;
  value: string;
};

export type SeasonFixtureInningsDisplay = {
  key: string;
  battingTitle: string;
  bowlingTitle: string;
  battingHeaders: string[];
  battingRows: string[][];
  bowlingHeaders: string[];
  bowlingRows: string[][];
  hasFallOfWickets: boolean;
};

export type SeasonFixtureMatchResultDisplay = {
  resultStatement?: string;
  tossLine?: string;
};

export type SeasonFixtureRenderEntry = {
  id: number;
  status: string;
  processedAt?: string;
  kind: "upcoming" | "result";
};

export type SeasonFixtureValidationDisplay = {
  overallScore?: number;
  status?: string;
  breakdown: { key: string; label: string; value: number }[];
};

export type SeasonFixtureContentNote = {
  hasBasePrompt: boolean;
  hasUpcomingFixturePrompt: boolean;
  summaryLines: string[];
};

export type SeasonFixtureViewModel = {
  fixtureRecord: UnknownRecord | undefined;
  gradeContext: UnknownRecord | undefined;
  teamsData: UnknownRecord | undefined;
  teamSides: { home: SeasonFixtureTeamSide; away: SeasonFixtureTeamSide } | null;
  downloadEntries: SeasonFixtureDownloadEntry[];
  renderStatus: UnknownRecord | undefined;
  meta: UnknownRecord | undefined;
  context: UnknownRecord | undefined;
  headline: string;
  homeTeam: string;
  awayTeam: string;
  homeScoreLine: string | undefined;
  awayScoreLine: string | undefined;
  scorecardUrl: string | undefined;
  dateRaw: string | undefined;
  dateLabel: string;
  timeLabel: string | undefined;
  round: string | undefined;
  type: string | undefined;
  status: string | undefined;
  gameId: string | undefined;
  venueGround: string | undefined;
  gradeName: string;
  gradeGender: string | undefined;
  gradeAgeGroup: string | undefined;
  competitionName: string;
  associationName: string | undefined;
  competitionBreadcrumbLabel: string;
  renderStatusLine: string | undefined;
  renderLastRun: string | undefined;
  contextMetaRows: SeasonFixtureContextMetaRow[];
  hasOutputs: boolean;
  headerContextLine: string | null;
  isFinished: boolean;
  resultStatement?: string;
  tossLine?: string;
  inningsScorecards: SeasonFixtureInningsDisplay[];
  validationSummary?: SeasonFixtureValidationDisplay;
  renderEntries: SeasonFixtureRenderEntry[];
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  associationLogoUrl?: string | null;
  hasScorecardTables: boolean;
  showScorecardSection: boolean;
  contentNote?: SeasonFixtureContentNote;
};
