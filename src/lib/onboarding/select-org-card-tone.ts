import type { AccountSummary, OnboardingStateData } from "@/types/api/account";

/** Card surface for `/select-organisation` (excludes `loading`, handled at call site). */
export type SelectOrgCardLifecycleTone = "default" | "error" | "warning";

function wizardDoneFromState(state: OnboardingStateData): boolean {
  return (
    state.hasCompletedOnboardingWizard === true || state.onboardingWizardStatus === "completed"
  );
}

/**
 * Maps onboarding lifecycle to grid card tone. Aligns with {@link resolveAccountEntry} wizard/setup semantics.
 */
export function selectOrgCardToneFromOnboardingState(
  state: OnboardingStateData,
): SelectOrgCardLifecycleTone {
  if (state.isSetup === true) return "default";
  if (!wizardDoneFromState(state)) return "error";
  return "warning";
}

/**
 * Dev simulator / optional CMS bootstrap: when `hasCompletedOnboardingWizard` is absent, returns `default`.
 */
export function selectOrgCardToneFromAccountSummary(
  row: AccountSummary,
): SelectOrgCardLifecycleTone {
  if (row.isSetup === true) return "default";
  if (row.hasCompletedOnboardingWizard === undefined) return "default";
  if (row.hasCompletedOnboardingWizard !== true) return "error";
  return "warning";
}
