import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    group: vi.fn(),
    reset: vi.fn(),
  },
}));

import {
  __markAnalyticsInitializedForTests,
  __resetAnalyticsForTests,
  __setAnalyticsClientForTests,
  captureConversion,
  captureEvent,
  identifyUser,
  resetAnalytics,
} from "./analytics";
import * as consent from "./consent";

const FEATURE_KEY = "NEXT_PUBLIC_FEATURE_ANALYTICS";
const POSTHOG_KEY = "NEXT_PUBLIC_POSTHOG_KEY";

describe("analytics capture", () => {
  afterEach(() => {
    __resetAnalyticsForTests();
    delete process.env[FEATURE_KEY];
    delete process.env[POSTHOG_KEY];
    vi.restoreAllMocks();
  });

  it("no-ops when analytics is not ready", () => {
    const capture = vi.fn();
    __setAnalyticsClientForTests({ capture } as never);

    captureEvent("user_action", { action: "test" });
    expect(capture).not.toHaveBeenCalled();
  });

  it("captures events with surface app when ready", () => {
    process.env[FEATURE_KEY] = "true";
    process.env[POSTHOG_KEY] = "phc_test";
    vi.spyOn(consent, "readBrowserAnalyticsConsent").mockReturnValue(true);

    const capture = vi.fn();
    const identify = vi.fn();
    const group = vi.fn();
    const reset = vi.fn();
    __setAnalyticsClientForTests({ capture, identify, group, reset } as never);
    __markAnalyticsInitializedForTests();

    captureEvent("user_action", { action: "bundles_viewed", accountId: "12" });
    expect(capture).toHaveBeenCalledWith("user_action", {
      surface: "app",
      action: "bundles_viewed",
      accountId: "12",
    });

    captureConversion("login_success");
    expect(capture).toHaveBeenCalledWith("conversion", {
      surface: "app",
      name: "login_success",
    });

    identifyUser("42");
    expect(identify).toHaveBeenCalledWith("42");

    resetAnalytics();
    expect(reset).toHaveBeenCalled();
  });
});
