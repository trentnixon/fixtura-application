import type {
  SeasonCompetitionDetailMeta,
  SeasonCompetitionNormalizedGrade,
  SeasonFixtureViewModel,
  SeasonGradeDisplayModel,
  SeasonGradeFixtureFilterOptions,
  SeasonOverviewCompetitionRow,
  UnknownRecord,
} from "./season-components";
import type {
  TriggerGradesCompsSingleScrapeRequest,
  TriggerResultSingleScrapeRequest,
} from "@/types/api/account";
import type {
  SeasonHubFixtureListItem,
  SeasonHubReconResponse,
  SeasonHubStatsResponse,
} from "@/types/api/season-hub";

export type SeasonOverviewHeaderProps = {
  accountId: string;
  loading: boolean;
  orgSyncPending: boolean;
  onRefresh: () => void;
  onOpenSync: () => void;
};

export type OrgSyncForDialog = {
  canTrigger: boolean;
  isPending: boolean;
  errorReason: string | null;
  triggerSync: () => Promise<void>;
};

export type SeasonOverviewSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSync: OrgSyncForDialog;
};

export type SeasonOverviewSummarySectionProps = {
  reconData: SeasonHubReconResponse["data"];
  statsData: SeasonHubStatsResponse["data"] | undefined;
};

export type SeasonOverviewEmptyStatesProps = {
  reconPresent: boolean;
  allResourceZeros: boolean;
  competitionsUnavailable: boolean;
  listEmptyButScopeShowsCompetitions: boolean;
  onRefetchCompetitions: () => void;
};

export type SeasonOverviewCompetitionCardProps = {
  accountId: string;
  competition: SeasonOverviewCompetitionRow;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type SeasonOverviewTrackedCompetitionsSectionProps = {
  accountId: string;
  competitionsUnavailable: boolean;
  allResourceZeros: boolean;
  pagination: PaginationMeta | undefined;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  seasonFilter: string;
  setSeasonFilter: (value: string) => void;
  associationFilter: string;
  setAssociationFilter: (value: string) => void;
  coverageFilter: string;
  setCoverageFilter: (value: string) => void;
  statusOptions: string[];
  seasonOptions: string[];
  associationOptions: string[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  sortedCompetitionRows: SeasonOverviewCompetitionRow[];
  filteredCompetitionRows: SeasonOverviewCompetitionRow[];
};

export type SeasonCompetitionDetailHeaderProps = {
  accountId: string;
  competitionPageTitle: string;
  competitionMeta: SeasonCompetitionDetailMeta | null;
  headerContextLine: string | null;
  timeframeLine: string | null;
  competitionHeaderActive: boolean;
  competitionStatus: string;
  seasonOverviewHref: string;
  isFetching: boolean;
  canQueueGradesRefresh: boolean;
  onReload: () => void;
  onOpenSyncGrades: () => void;
};

export type SeasonCompetitionCoverageSummarySectionProps = {
  statGradeCount: number;
  statTeamCount: number;
  statFixtureCount: number;
};

export type SeasonCompetitionSyncGradesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cmsCompetitionNumericId: number;
  isPending: boolean;
  mutateAsync: (body: TriggerGradesCompsSingleScrapeRequest) => Promise<unknown>;
};

export type SeasonCompetitionTrackedGradesSectionProps = {
  accountId: string;
  competitionId: string;
  seasonOverviewHref: string;
  gradesPending: boolean;
  gradesEmpty: boolean;
  gradesCountFromDetail: number | undefined;
  normalizedGrades: SeasonCompetitionNormalizedGrade[];
  filteredGradeRows: SeasonCompetitionNormalizedGrade[];
  gradeSearchQuery: string;
  onGradeSearchChange: (value: string) => void;
};

export type SeasonGradeViewHeaderProps = {
  accountId: string;
  competitionHref: string;
  displayModel: SeasonGradeDisplayModel;
  gradeRaw: UnknownRecord | undefined;
  isFetching: boolean;
  isSyncMutating: boolean;
  canQueueCombinedSync: boolean;
  onOpenSync: () => void;
};

export type SeasonGradeCoverageSummarySectionProps = {
  teamCount: number;
  fixtureCount: number;
};

export type SeasonGradeSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncMutating: boolean;
  cmsCompetitionNumericId: number;
  cmsGradeNumericId: number;
  teamsMutateAsync: (args: { competitionId: number }) => Promise<unknown>;
  fixturesMutateAsync: (args: { id: number }) => Promise<unknown>;
  onSynced: () => void;
};

export type SeasonGradeFixturesSectionProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
  competitionHref: string;
  fixturesEmpty: boolean;
  fixturesCountFromGrade: number | undefined;
  fixtureRows: SeasonHubFixtureListItem[];
  filteredRows: SeasonHubFixtureListItem[];
  previousRows: SeasonHubFixtureListItem[];
  upcomingRows: SeasonHubFixtureListItem[];
  previousDefaultCount: number;
  upcomingDefaultCount: number;
  allPreviousCount: number;
  allUpcomingCount: number;
  showAllPrevious: boolean;
  setShowAllPrevious: (value: boolean) => void;
  showAllUpcoming: boolean;
  setShowAllUpcoming: (value: boolean) => void;
  team: string;
  setTeam: (value: string) => void;
  venue: string;
  setVenue: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  options: SeasonGradeFixtureFilterOptions;
  hasActiveFilters: boolean;
  clearFilters: () => void;
};

export type SeasonGradeFixturesToolbarProps = {
  team: string;
  onTeamChange: (value: string) => void;
  venue: string;
  onVenueChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  options: SeasonGradeFixtureFilterOptions;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  showFilterFields: boolean;
};

export type SeasonGradeFixturesTableProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
  filteredRows: SeasonHubFixtureListItem[];
};

export type SeasonFixtureViewHeaderProps = {
  accountId: string;
  seasonBase: string;
  competitionHref: string;
  gradeHref: string;
  model: SeasonFixtureViewModel;
  isFetching: boolean;
  isSyncMutating: boolean;
  canQueueResultSync: boolean;
  onOpenSync: () => void;
};

export type SeasonFixtureResultSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncMutating: boolean;
  payload: TriggerResultSingleScrapeRequest;
  onConfirm: () => void | Promise<void>;
};

export type SeasonFixtureDetailTabsSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureMatchSummarySectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureGradeContextSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureContextMetaSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureGradeFixturesErrorBannerProps = {
  message: string;
};

export type SeasonFixtureOutputsSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureTeamsSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureScorecardsSectionProps = {
  model: SeasonFixtureViewModel;
};

export type SeasonFixtureContentNoteSectionProps = {
  model: SeasonFixtureViewModel;
};
