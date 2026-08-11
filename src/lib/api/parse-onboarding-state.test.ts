import { describe, expect, it } from "vitest";

import { parseOnboardingStatePayload } from "./parse-onboarding-state";

const minimalValid = {
  data: {
    accountId: 42,
    onboardingWizardStatus: "in_progress",
    onboardingCurrentStep: 2,
    onboardingLastCompletedStep: 1,
    onboardingStartedAt: "2026-04-08T12:00:00.000Z",
    onboardingLastActivityAt: "2026-04-08T12:05:00.000Z",
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
    isActive: false,
  },
};

describe("parseOnboardingStatePayload", () => {
  it("parses wrapped data", () => {
    const r = parseOnboardingStatePayload(minimalValid);
    expect(r).not.toBeNull();
    expect(r!.accountId).toBe(42);
    expect(r!.onboardingCurrentStep).toBe(2);
    expect(r!.onboardingWizardStatus).toBe("in_progress");
  });

  it("parses unwrapped root", () => {
    const r = parseOnboardingStatePayload(minimalValid.data);
    expect(r).not.toBeNull();
    expect(r!.accountId).toBe(42);
  });

  it("coerces string accountId", () => {
    const r = parseOnboardingStatePayload({
      data: { ...minimalValid.data, accountId: "99" as unknown as number },
    });
    expect(r).not.toBeNull();
    expect(r!.accountId).toBe(99);
  });

  it("returns null for invalid wizard status", () => {
    const r = parseOnboardingStatePayload({
      data: { ...minimalValid.data, onboardingWizardStatus: "bogus" },
    });
    expect(r).toBeNull();
  });
});
