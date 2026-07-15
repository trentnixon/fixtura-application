export type SelectOrganisationDisplayState =
  | "status-loading"
  | "active"
  | "setup-required"
  | "preparing"
  | "updating"
  | "needs-attention"
  | "inactive"
  | "status-unavailable";

export type SelectOrganisationLifecycleQueryStatus = "pending" | "error" | "success";

export type SelectOrganisationItemViewModel = {
  accountId: string;
  name: string;
  sport?: string;
  logo?: string;
  playHqId?: string;
  brandColors?: { primary: string; secondary: string };
  displayState: SelectOrganisationDisplayState;
  statusLabel: string;
  statusDescription: string;
  primaryActionLabel: string;
  isNew: boolean;
  isLastUsed: boolean;
  lastOpenedAt?: string;
  onboardingStep?: { current: number; total: number };
  createdAt?: string;
  isRightsHolder?: boolean | null;
  isPermissionGiven?: boolean | null;
  onboardingLastActivityAt?: string | null;
  canRetrySetup: boolean;
  isActive?: boolean;
};

export function selectOrgPrimaryButtonVariant(
  item: Pick<SelectOrganisationItemViewModel, "displayState" | "primaryActionLabel">,
): "default" | "destructive" | "warningOutline" | "primaryOutline" {
  if (item.displayState === "setup-required" && item.primaryActionLabel === "Continue setup") {
    return "warningOutline";
  }
  if (item.displayState === "needs-attention") {
    return "destructive";
  }
  if (item.primaryActionLabel === "Open organisation") {
    return "primaryOutline";
  }
  return "default";
}

export const SELECT_ORG_ONBOARDING_STEP_TOTAL = 4;

export const SELECT_ORG_STATUS_LABELS: Record<
  Exclude<SelectOrganisationDisplayState, "status-loading">,
  string
> = {
  active: "Active",
  "setup-required": "Setup required",
  preparing: "Preparing workspace",
  updating: "Updating",
  "needs-attention": "Needs attention",
  inactive: "Inactive",
  "status-unavailable": "Status unavailable",
};

export const SELECT_ORG_STATUS_DESCRIPTIONS: Record<
  Exclude<SelectOrganisationDisplayState, "status-loading">,
  string
> = {
  active: "This organisation is ready to use.",
  "setup-required": "Finish organisation setup before all features become available.",
  preparing:
    "Fixtura is setting up this organisation and importing its data. You can open it while this continues.",
  updating: "Fixtura is refreshing this organisation's data. Existing features remain available.",
  "needs-attention": "Workspace preparation did not complete and needs review.",
  inactive: "This workspace is currently inactive and some features may be unavailable.",
  "status-unavailable": "Fixtura could not load the latest workspace status.",
};

export const SELECT_ORG_PRIMARY_ACTION_LABELS: Record<SelectOrganisationDisplayState, string> = {
  "status-loading": "Open organisation",
  active: "Open organisation",
  "setup-required": "Continue setup",
  preparing: "Open organisation",
  updating: "Open organisation",
  "needs-attention": "Review issue",
  inactive: "View organisation",
  "status-unavailable": "Open organisation",
};
