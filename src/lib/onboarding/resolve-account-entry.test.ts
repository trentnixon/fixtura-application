import { describe, expect, it } from "vitest";

import { accountEntryPath, resolveAccountEntry } from "./resolve-account-entry";

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

describe("resolveAccountEntry", () => {
  it("returns dashboard when wizard completed (including when isSetup is false)", () => {
    expect(
      resolveAccountEntry(
        baseState({
          onboardingWizardStatus: "completed",
          hasCompletedOnboardingWizard: true,
          initialSetupStatus: "running",
          initialDataFetchStatus: "queued",
          isSetup: false,
        }),
      ),
    ).toBe("dashboard");
  });

  it("returns dashboard when wizard completed even if pipelines failed (non-blocking for routing)", () => {
    expect(
      resolveAccountEntry(
        baseState({
          hasCompletedOnboardingWizard: true,
          initialSetupStatus: "failed",
          isSetup: false,
        }),
      ),
    ).toBe("dashboard");
  });

  it("returns wizard when wizard not completed", () => {
    expect(
      resolveAccountEntry(
        baseState({
          onboardingWizardStatus: "in_progress",
          onboardingCurrentStep: 2,
        }),
      ),
    ).toBe("wizard");
  });
});

describe("accountEntryPath", () => {
  it("builds dashboard path", () => {
    expect(accountEntryPath("dashboard", "42")).toBe("/o/42/dashboard");
  });

  it("builds wizard path with query", () => {
    expect(accountEntryPath("wizard", "42")).toBe("/create-organisation?accountId=42");
  });
});
