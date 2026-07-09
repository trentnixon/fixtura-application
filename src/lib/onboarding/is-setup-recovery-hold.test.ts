import { describe, expect, it } from "vitest";

import { isSetupStatusFailed, shouldHoldSetupRecoveryPage } from "./is-setup-recovery-hold";

describe("isSetupStatusFailed", () => {
  it("returns true for failed status", () => {
    expect(isSetupStatusFailed("failed")).toBe(true);
    expect(isSetupStatusFailed(" FAILED ")).toBe(true);
  });

  it("returns false for non-failed or missing status", () => {
    expect(isSetupStatusFailed("in_progress")).toBe(false);
    expect(isSetupStatusFailed("ready")).toBe(false);
    expect(isSetupStatusFailed(null)).toBe(false);
    expect(isSetupStatusFailed(undefined)).toBe(false);
  });
});

describe("shouldHoldSetupRecoveryPage", () => {
  it("holds when setup status is still pending", () => {
    expect(shouldHoldSetupRecoveryPage({ setupPending: true, setupFailed: false })).toBe(true);
  });

  it("holds when setup status is failed", () => {
    expect(shouldHoldSetupRecoveryPage({ setupPending: false, setupFailed: true })).toBe(true);
  });

  it("does not hold when setup has settled and is not failed", () => {
    expect(shouldHoldSetupRecoveryPage({ setupPending: false, setupFailed: false })).toBe(false);
  });
});
