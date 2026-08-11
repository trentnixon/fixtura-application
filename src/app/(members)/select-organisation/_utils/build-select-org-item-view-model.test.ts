import { describe, expect, it } from "vitest";

import {
  accountOrganisationSummaryFixture,
  accountSummaryFixture,
} from "@/lib/account/account-summary-fixture";

import {
  buildSelectOrgItemViewModel,
  resolveSelectOrgDisplayState,
  resolveSelectOrgDisplayStateFromAccountSummary,
} from "./build-select-org-item-view-model";

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

function row(over: Partial<AccountSummary> = {}) {
  return accountSummaryFixture({
    accountOrganisationDetails: accountOrganisationSummaryFixture({ id: 101, Name: "Test Org" }),
    id: 101,
    ...over,
  });
}

describe("resolveSelectOrgDisplayState", () => {
  it("returns status-loading when lifecycle query is pending", () => {
    expect(resolveSelectOrgDisplayState("pending", baseState())).toBe("status-loading");
  });

  it("returns status-unavailable when lifecycle query errors", () => {
    expect(resolveSelectOrgDisplayState("error", baseState())).toBe("status-unavailable");
  });

  it("returns needs-attention only when pipeline status is failed", () => {
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({
          initialSetupFailureReason: "Something broke",
          initialSetupStatus: "failed",
        }),
      ),
    ).toBe("needs-attention");
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({ initialSetupFailureReason: "Something broke" }),
      ),
    ).not.toBe("needs-attention");
  });

  it("returns setup-required when wizard is incomplete", () => {
    expect(
      resolveSelectOrgDisplayState("success", baseState({ onboardingWizardCompletedAt: null })),
    ).toBe("setup-required");
  });

  it("returns preparing when wizard done but isSetup is false", () => {
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: false,
        }),
      ),
    ).toBe("preparing");
  });

  it("returns updating when setup complete and isUpdating", () => {
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: true,
          isUpdating: true,
        }),
      ),
    ).toBe("updating");
  });

  it("returns inactive when not active", () => {
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: true,
          isActive: false,
        }),
      ),
    ).toBe("inactive");
  });

  it("returns active when setup complete and active", () => {
    expect(
      resolveSelectOrgDisplayState(
        "success",
        baseState({
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: true,
          isActive: true,
        }),
      ),
    ).toBe("active");
  });
});

describe("resolveSelectOrgDisplayStateFromAccountSummary", () => {
  it("maps me-row signals for simulator", () => {
    expect(
      resolveSelectOrgDisplayStateFromAccountSummary(
        row({ onboardingWizardCompletedAt: null, isSetup: false }),
      ),
    ).toBe("setup-required");
    expect(
      resolveSelectOrgDisplayStateFromAccountSummary(
        row({
          onboardingWizardCompletedAt: "2026-01-01T00:00:00.000Z",
          isSetup: true,
          isActive: true,
        }),
      ),
    ).toBe("active");
  });
});

describe("buildSelectOrgItemViewModel", () => {
  it("builds primary action labels from display state", () => {
    const vm = buildSelectOrgItemViewModel({
      row: row({ onboardingWizardCompletedAt: null }),
      lifecycleQueryStatus: "success",
      onboardingState: baseState({ onboardingWizardCompletedAt: null }),
      simulating: false,
      isLastUsed: false,
    });
    expect(vm.primaryActionLabel).toBe("Continue setup");
    expect(vm.statusLabel).toBe("Setup required");
  });

  it("marks retry when pipeline failed", () => {
    const vm = buildSelectOrgItemViewModel({
      row: row(),
      lifecycleQueryStatus: "success",
      onboardingState: baseState({ initialSetupStatus: "failed" }),
      simulating: false,
      isLastUsed: false,
    });
    expect(vm.displayState).toBe("needs-attention");
    expect(vm.canRetrySetup).toBe(true);
    expect(vm.primaryActionLabel).toBe("Review issue");
  });
});
