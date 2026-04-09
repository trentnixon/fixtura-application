import type { OnboardingStateData } from "@/types/api/account";

/**
 * Epic 6 — CMS allows DELETE only for incomplete wizard accounts (not setup-complete).
 * Single source of truth for delete affordance visibility.
 */
export function canDeleteUnfinishedOnboardingAccount(
  state: OnboardingStateData | undefined,
): boolean {
  if (!state) return false;
  if (state.hasCompletedOnboardingWizard) return false;
  if (state.isSetup === true) return false;
  return true;
}
