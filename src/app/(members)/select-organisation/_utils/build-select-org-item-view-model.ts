import { organisationDetailsFromAccountRow } from "@/lib/account/account-me-rows";
import { organisationDisplayNameFromAccountRow } from "@/lib/account/organisation-display-name";
import {
  isNewSelectOrgAccount,
  selectOrgCardBrandPalette,
} from "@/lib/account/select-org-card-display";
import { isSelectOrgContinueSetup } from "@/lib/onboarding/select-org-card-tone";

import {
  SELECT_ORG_ONBOARDING_STEP_TOTAL,
  SELECT_ORG_PRIMARY_ACTION_LABELS,
  SELECT_ORG_STATUS_DESCRIPTIONS,
  SELECT_ORG_STATUS_LABELS,
} from "./select-org-display-state";

import type {
  SelectOrganisationDisplayState,
  SelectOrganisationItemViewModel,
  SelectOrganisationLifecycleQueryStatus,
} from "./select-org-display-state";
import type { AccountSummary, OnboardingStateData } from "@/types/api/account";

function pipelineFailed(state: OnboardingStateData): boolean {
  return state.initialSetupStatus === "failed" || state.initialDataFetchStatus === "failed";
}

export function resolveSelectOrgDisplayState(
  lifecycleQueryStatus: SelectOrganisationLifecycleQueryStatus,
  state?: OnboardingStateData,
): SelectOrganisationDisplayState {
  if (lifecycleQueryStatus === "pending") return "status-loading";
  if (lifecycleQueryStatus === "error" || !state) return "status-unavailable";
  if (pipelineFailed(state)) return "needs-attention";
  if (state.onboardingWizardCompletedAt === null) return "setup-required";
  if (state.isSetup !== true) return "preparing";
  if (state.isSetup === true && state.isUpdating === true) return "updating";
  if (state.isActive === false) return "inactive";
  if (state.isSetup === true && state.isActive === true) return "active";
  return "preparing";
}

/** Dev simulator / me-row-only lifecycle when onboarding-state is not fetched. */
export function resolveSelectOrgDisplayStateFromAccountSummary(
  row: AccountSummary,
): SelectOrganisationDisplayState {
  if (isSelectOrgContinueSetup(row)) return "setup-required";
  if (row.isSetup !== true) return "preparing";
  if (row.isUpdating === true) return "updating";
  if (row.isActive === false) return "inactive";
  if (row.isSetup === true && row.isActive === true) return "active";
  return "preparing";
}

function statusCopy(displayState: SelectOrganisationDisplayState): {
  statusLabel: string;
  statusDescription: string;
} {
  if (displayState === "status-loading") {
    return { statusLabel: "", statusDescription: "" };
  }
  return {
    statusLabel: SELECT_ORG_STATUS_LABELS[displayState],
    statusDescription: SELECT_ORG_STATUS_DESCRIPTIONS[displayState],
  };
}

export type BuildSelectOrgItemViewModelInput = {
  row: AccountSummary;
  lifecycleQueryStatus: SelectOrganisationLifecycleQueryStatus;
  onboardingState?: OnboardingStateData;
  simulating: boolean;
  isLastUsed: boolean;
  lastOpenedAt?: string;
};

export function buildSelectOrgItemViewModel(
  input: BuildSelectOrgItemViewModelInput,
): SelectOrganisationItemViewModel {
  const { row, lifecycleQueryStatus, onboardingState, simulating, isLastUsed, lastOpenedAt } =
    input;
  const id = String(row.id);
  const org = organisationDetailsFromAccountRow(row);
  const name = organisationDisplayNameFromAccountRow(row);
  const brandColors = selectOrgCardBrandPalette(row);

  const displayState = simulating
    ? resolveSelectOrgDisplayStateFromAccountSummary(row)
    : resolveSelectOrgDisplayState(lifecycleQueryStatus, onboardingState);

  const { statusLabel, statusDescription } = statusCopy(displayState);

  const onboardingStep =
    !simulating &&
    onboardingState &&
    onboardingState.onboardingWizardCompletedAt === null &&
    onboardingState.onboardingCurrentStep > 0
      ? {
          current: onboardingState.onboardingCurrentStep,
          total: SELECT_ORG_ONBOARDING_STEP_TOTAL,
        }
      : undefined;

  const canRetrySetup =
    !simulating &&
    onboardingState !== undefined &&
    (onboardingState.initialSetupStatus === "failed" ||
      onboardingState.initialDataFetchStatus === "failed");

  return {
    accountId: id,
    name,
    ...(org?.Sport ? { sport: org.Sport } : {}),
    ...(org?.ParentLogo?.trim() ? { logo: org.ParentLogo.trim() } : {}),
    ...(org?.PlayHQID ? { playHqId: org.PlayHQID } : {}),
    ...(brandColors ? { brandColors } : {}),
    displayState,
    statusLabel,
    statusDescription,
    primaryActionLabel: SELECT_ORG_PRIMARY_ACTION_LABELS[displayState],
    isNew: isNewSelectOrgAccount(row.createdAt),
    isLastUsed,
    ...(lastOpenedAt ? { lastOpenedAt } : {}),
    ...(onboardingStep ? { onboardingStep } : {}),
    createdAt: row.createdAt,
    isRightsHolder: row.isRightsHolder,
    isPermissionGiven: row.isPermissionGiven,
    onboardingLastActivityAt: onboardingState?.onboardingLastActivityAt ?? null,
    canRetrySetup,
    isActive: simulating ? row.isActive : (onboardingState?.isActive ?? row.isActive),
  };
}
