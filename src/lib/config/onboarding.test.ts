import { describe, expect, it } from "vitest";

import { isTerminalOnboardingSetupStatus } from "./onboarding";

describe("isTerminalOnboardingSetupStatus", () => {
  it("treats ready and failed as terminal", () => {
    expect(isTerminalOnboardingSetupStatus("ready")).toBe(true);
    expect(isTerminalOnboardingSetupStatus("failed")).toBe(true);
    expect(isTerminalOnboardingSetupStatus("READY")).toBe(true);
  });

  it("treats in_progress as non-terminal", () => {
    expect(isTerminalOnboardingSetupStatus("in_progress")).toBe(false);
  });
});
