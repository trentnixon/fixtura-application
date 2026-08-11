import { describe, expect, it } from "vitest";

import { accountSummaryFixture } from "@/lib/account/account-summary-fixture";

import {
  isSelectOrgContinueSetup,
  selectOrgCardToneFromAccountSummary,
  selectOrgCardToneFromOnboardingState,
} from "./select-org-card-tone";

import type { AccountSummary, OnboardingStateData } from "@/types/api/account";

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

  it("returns error when onboardingWizardCompletedAt is null", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "in_progress",
          hasCompletedOnboardingWizard: false,
          onboardingWizardCompletedAt: null,
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
          onboardingWizardCompletedAt: null,
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
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: false,
        }),
      ),
    ).toBe("warning");
  });

  it("treats onboardingWizardCompletedAt timestamp as wizard done even if flags lag", () => {
    expect(
      selectOrgCardToneFromOnboardingState(
        baseState({
          onboardingWizardStatus: "in_progress",
          hasCompletedOnboardingWizard: false,
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: false,
        }),
      ),
    ).toBe("warning");
  });
});

describe("selectOrgCardToneFromAccountSummary", () => {
  it("returns default when isSetup true", () => {
    expect(
      selectOrgCardToneFromAccountSummary(
        accountSummaryFixture({
          id: 1,
          isSetup: true,
          hasCompletedOnboardingWizard: false,
          onboardingWizardCompletedAt: null,
        }),
      ),
    ).toBe("default");
  });

  it("returns default when unfinished signals omitted", () => {
    expect(selectOrgCardToneFromAccountSummary({ id: 1, isSetup: false } as AccountSummary)).toBe(
      "default",
    );
  });

  it("returns error when onboardingWizardCompletedAt is null", () => {
    expect(
      selectOrgCardToneFromAccountSummary(
        accountSummaryFixture({
          id: 1,
          isSetup: false,
          onboardingWizardCompletedAt: null,
        }),
      ),
    ).toBe("error");
  });

  it("returns error from hasCompletedOnboardingWizard when timestamp absent", () => {
    expect(
      selectOrgCardToneFromAccountSummary(
        accountSummaryFixture({
          id: 1,
          isSetup: false,
          hasCompletedOnboardingWizard: false,
        }),
      ),
    ).toBe("error");
  });

  it("returns warning when wizard complete and setup pending", () => {
    expect(
      selectOrgCardToneFromAccountSummary(
        accountSummaryFixture({
          id: 1,
          isSetup: false,
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
        }),
      ),
    ).toBe("warning");
  });
});

describe("isSelectOrgContinueSetup", () => {
  it("uses me-row onboardingWizardCompletedAt when present", () => {
    expect(
      isSelectOrgContinueSetup(
        accountSummaryFixture({
          id: 101,
          onboardingWizardCompletedAt: null,
          isSetup: true,
        }),
      ),
    ).toBe(true);

    expect(
      isSelectOrgContinueSetup(
        accountSummaryFixture({
          id: 202,
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: false,
        }),
      ),
    ).toBe(false);
  });

  it("falls back to onboarding-state when me-row timestamp is absent", () => {
    expect(
      isSelectOrgContinueSetup(
        { id: 101 } as AccountSummary,
        baseState({ onboardingWizardCompletedAt: null }),
      ),
    ).toBe(true);

    expect(
      isSelectOrgContinueSetup(
        { id: 202 } as AccountSummary,
        baseState({ onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z" }),
      ),
    ).toBe(false);
  });

  it("does not treat isSetup alone as continue-setup", () => {
    expect(isSelectOrgContinueSetup({ id: 101, isSetup: false } as AccountSummary)).toBe(false);
    expect(isSelectOrgContinueSetup({ id: 202, isSetup: true } as AccountSummary)).toBe(false);
  });
});
