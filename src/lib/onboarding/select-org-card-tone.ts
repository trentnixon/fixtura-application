import type { AccountSummary, OnboardingStateData } from "@/types/api/account";

/** Card surface for `/select-organisation` (excludes `loading`, handled at call site). */
export type SelectOrgCardLifecycleTone = "default" | "error" | "warning";

/**
 * Wizard unfinished for Continue setup presentation.
 * Prefers `onboardingWizardCompletedAt === null` on the me-row; otherwise onboarding-state;
 * never uses `isSetup` / `isActive`.
 */
export function isSelectOrgContinueSetup(
  row: AccountSummary,
  state?: OnboardingStateData,
): boolean {
  if (row.onboardingWizardCompletedAt !== undefined) {
    return row.onboardingWizardCompletedAt === null;
  }
  if (state) {
    return state.onboardingWizardCompletedAt === null;
  }
  if (row.hasCompletedOnboardingWizard !== undefined) {
    return row.hasCompletedOnboardingWizard !== true;
  }
  return false;
}

function wizardDoneFromState(state: OnboardingStateData): boolean {
  return state.onboardingWizardCompletedAt !== null;
}

/**
 * Maps onboarding lifecycle to grid card tone. Aligns with {@link resolveAccountEntry} wizard/setup semantics.
 * Prefers `onboardingWizardCompletedAt` when classifying unfinished vs wizard-done.
 */
export function selectOrgCardToneFromOnboardingState(
  state: OnboardingStateData,
): SelectOrgCardLifecycleTone {
  if (state.isSetup === true) return "default";
  if (!wizardDoneFromState(state)) {
    if (state.isUpdating === true) return "warning";
    return "error";
  }
  return "warning";
}

/**
 * Dev simulator / optional CMS bootstrap tone.
 * Prefers `onboardingWizardCompletedAt` when present; otherwise `hasCompletedOnboardingWizard`.
 * When both unfinished signals are absent, returns `default`.
 */
export function selectOrgCardToneFromAccountSummary(
  row: AccountSummary,
): SelectOrgCardLifecycleTone {
  if (row.isSetup === true) return "default";

  if (row.onboardingWizardCompletedAt !== undefined) {
    if (row.onboardingWizardCompletedAt === null) {
      if (row.isUpdating === true) return "warning";
      return "error";
    }
    return "warning";
  }

  if (row.hasCompletedOnboardingWizard === undefined) return "default";
  if (row.hasCompletedOnboardingWizard !== true) return "error";
  return "warning";
}
