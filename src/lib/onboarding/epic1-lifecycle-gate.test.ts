import { describe, expect, it } from "vitest";

import { accountEntryFromOnboardingState } from "./resolve-account-entry";

import type { OnboardingStateData } from "@/types/api/account";

function baseState(over: Partial<OnboardingStateData> = {}): OnboardingStateData {
  return {
    accountId: 1,
    onboardingWizardStatus: "not_started",
    onboardingCurrentStep: 0,
    onboardingLastCompletedStep: 0,
    onboardingStartedAt: null,
    onboardingLastActivityAt: null,
    hasCompletedOnboardingWizard: false,
    onboardingWizardCompletedAt: null,
    initialSetupStatus: "not_started",
    initialSetupStartedAt: null,
    initialSetupCompletedAt: null,
    initialSetupFailedAt: null,
    initialSetupFailureReason: null,
    initialDataFetchStatus: "not_started",
    initialDataFetchStartedAt: null,
    initialDataFetchCompletedAt: null,
    initialDataFetchFailedAt: null,
    initialDataFetchFailureReason: null,
    isSetup: false,
    isUpdating: false,
    isActive: true,
    ...over,
  };
}

/**
 * Epic 1 — `select-organisation` and `OrgAccessBoundary` must route using the same
 * `accountEntryFromOnboardingState` matrix (GET …/onboarding-state + resolver).
 */
describe("Epic 1 lifecycle gate (select-org + scoped boundary)", () => {
  const accountId = "99";

  it("Ticket 1.1: wizard complete → scoped dashboard (including when isSetup is true)", () => {
    expect(
      accountEntryFromOnboardingState(
        baseState({
          isSetup: true,
          hasCompletedOnboardingWizard: true,
          onboardingWizardStatus: "completed",
        }),
        accountId,
      ),
    ).toBe("/o/99/dashboard");
  });

  it("Ticket 1.1: unfinished wizard → create-organisation", () => {
    expect(
      accountEntryFromOnboardingState(
        baseState({ onboardingWizardStatus: "in_progress", onboardingCurrentStep: 2 }),
        accountId,
      ),
    ).toBe("/create-organisation?accountId=99");
  });

  it("Ticket 1.1: wizard done, setup running → scoped dashboard", () => {
    expect(
      accountEntryFromOnboardingState(
        baseState({
          onboardingWizardStatus: "completed",
          hasCompletedOnboardingWizard: true,
          initialSetupStatus: "running",
        }),
        accountId,
      ),
    ).toBe("/o/99/dashboard");
  });

  it("Ticket 1.1: wizard done, pipeline failed → scoped dashboard (failure surfaced in UI, not routing)", () => {
    expect(
      accountEntryFromOnboardingState(
        baseState({
          hasCompletedOnboardingWizard: true,
          initialSetupStatus: "failed",
        }),
        accountId,
      ),
    ).toBe("/o/99/dashboard");
  });

  it("Ticket 1.2: unfinished wizard never targets dashboard", () => {
    expect(accountEntryFromOnboardingState(baseState({ isSetup: false }), accountId)).not.toMatch(
      /^\/o\/[^/]+\/dashboard$/,
    );
  });
});
