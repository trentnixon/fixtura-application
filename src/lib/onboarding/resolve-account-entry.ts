import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import type { OnboardingStateData } from "@/types/api/account";

/**
 * Where to route the user for account entry / recovery (lifecycle v1).
 * Wizard completion unlocks the scoped app; `isSetup` and pipeline status are non-blocking for routing.
 */
export type AccountEntryIntent = "dashboard" | "wizard";

/**
 * Single source of truth for onboarding lifecycle routing from GET …/onboarding-state.
 */
export function resolveAccountEntry(state: OnboardingStateData): AccountEntryIntent {
  const wizardDone =
    state.hasCompletedOnboardingWizard === true || state.onboardingWizardStatus === "completed";
  if (!wizardDone) return "wizard";
  return "dashboard";
}

/**
 * Target path for the given intent (gateway uses query `accountId` for wizard).
 */
export function accountEntryPath(intent: AccountEntryIntent, accountId: string): string {
  const id = encodeURIComponent(accountId);
  switch (intent) {
    case "dashboard":
      return accountScopedRoutes.dashboard(accountId);
    case "wizard":
      return `${ROUTES.createOrganisation}?accountId=${id}`;
  }
}

/**
 * One call site for lifecycle routing: `select-organisation` and `OrgAccessBoundary` both use
 * `resolveAccountEntry` + `accountEntryPath`; this helper keeps tests and docs aligned.
 */
export function accountEntryFromOnboardingState(
  state: OnboardingStateData,
  accountId: string,
): string {
  return accountEntryPath(resolveAccountEntry(state), accountId);
}
