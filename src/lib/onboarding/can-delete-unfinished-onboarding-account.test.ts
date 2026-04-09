import { describe, expect, it } from "vitest";

import { canDeleteUnfinishedOnboardingAccount } from "./can-delete-unfinished-onboarding-account";

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

describe("canDeleteUnfinishedOnboardingAccount", () => {
  it("returns false when state is undefined", () => {
    expect(canDeleteUnfinishedOnboardingAccount(undefined)).toBe(false);
  });

  it("returns false when wizard is complete", () => {
    expect(
      canDeleteUnfinishedOnboardingAccount(
        baseState({ hasCompletedOnboardingWizard: true, onboardingWizardStatus: "completed" }),
      ),
    ).toBe(false);
  });

  it("returns false when setup is complete", () => {
    expect(canDeleteUnfinishedOnboardingAccount(baseState({ isSetup: true }))).toBe(false);
  });

  it("returns true for incomplete wizard and setup not complete", () => {
    expect(
      canDeleteUnfinishedOnboardingAccount(
        baseState({
          onboardingWizardStatus: "in_progress",
          onboardingCurrentStep: 2,
          hasCompletedOnboardingWizard: false,
          isSetup: false,
        }),
      ),
    ).toBe(true);
  });
});
