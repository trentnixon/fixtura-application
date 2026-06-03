export const BUNDLES_RENDERS_PAGE_SIZE = 25;

export const BUNDLES_RENDERS_LIST_COPY = {
  title: "Recent renders",
  description:
    "Weekly bundle runs for your organisation. View a render in Fixtura or open it on your content hub.",
  columnStatus: "Status",
  columnCreated: "Created",
  columnAction: "Actions",
  viewOnAdminAction: "View Render",
  viewOnContentHubAction: "Go to Hub",
  contentHubUnavailableTitle:
    "Content hub URL is not available. Set NEXT_PUBLIC_BUNDLES_HUBS_URL and ensure this account has a sport configured.",
  dateRangeLabel: "Created date",
  dateRangeDescription: "Filter renders by their created date.",
  dateRangePlaceholder: "Select date range",
  dateRangeClearAction: "Clear",
  noMatchesOnPage: "No renders match this date range.",
  emptyTitle: "No renders yet",
  emptyBody:
    "When your organisation completes a bundle run, it will appear here. Check your delivery schedule above.",
  errorTitle: "Could not load renders",
  feedbackErrorLabel: "Error",
  feedbackInfoLabel: "Info",
  retryAction: "Retry",
  paginationShowing: "Showing",
  paginationOf: "of",
  paginationResults: "results",
  paginationNone: "No results",
  paginationSingleResult: "1 render",
  paginationPrevious: "Previous",
  paginationNext: "Next",
} as const;
