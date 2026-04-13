import { describe, expect, it } from "vitest";

import {
  selectOrgCardToneFromAccountSummary,
  selectOrgCardToneFromOnboardingState,
} from "./select-org-card-tone";

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

describe("selectOrgCardToneFromOnboardingState", () => {
  it("returns default when setup complete", () => {
    expect(selectOrgCardToneFromOnboardingState(baseState({ isSetup: true }))).toBe("default");
  });

  it("returns error when wizard not finished", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "in_progress",
          hasCompletedOnboardingWizard: false,
          isSetup: false,
        }),
      ),
    ).toBe("error");
  });

  it("returns warning when wizard not finished but background update is in progress", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "in_progress",
          hasCompletedOnboardingWizard: false,
          isSetup: false,
          isUpdating: true,
        }),
      ),
    ).toBe("warning");
  });

  it("returns warning when wizard completed but setup not complete", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "completed",
          hasCompletedOnboardingWizard: true,
          isSetup: false,
        }),
      ),
    ).toBe("warning");
  });

  it("treats onboardingWizardStatus completed as wizard done", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "completed",
          hasCompletedOnboardingWizard: false,
          isSetup: false,
        }),
      ),
    ).toBe("warning");
  });
});

describe("selectOrgCardToneFromAccountSummary", () => {
  it("returns default when isSetup true", () => {
    expect(
      selectOrgCardToneFromAccountSummary({
        id: 1,
        isSetup: true,
        hasCompletedOnboardingWizard: false,
      }),
    ).toBe("default");
  });

  it("returns default when wizard flag omitted", () => {
    expect(selectOrgCardToneFromAccountSummary({ id: 1, isSetup: false })).toBe("default");
  });

  it("returns error when wizard not complete", () => {
    expect(
      selectOrgCardToneFromAccountSummary({
        id: 1,
        isSetup: false,
        hasCompletedOnboardingWizard: false,
      }),
    ).toBe("error");
  });

  it("returns warning when wizard complete and setup pending", () => {
    expect(
      selectOrgCardToneFromAccountSummary({
        id: 1,
        isSetup: false,
        hasCompletedOnboardingWizard: true,
      }),
    ).toBe("warning");
  });
});
