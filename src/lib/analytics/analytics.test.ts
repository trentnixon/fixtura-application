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
  capturePageView,
  clearOrganizationGroup,
  groupOrganization,
  identifyUser,
  resetAnalytics,
} from "./analytics";

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

  it("skips capture on excluded paths", () => {
    process.env[FEATURE_KEY] = "true";
    process.env[POSTHOG_KEY] = "phc_test";

    const capture = vi.fn();
    __setAnalyticsClientForTests({ capture } as never);
    __markAnalyticsInitializedForTests();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/sandbox/kitchen-sink" },
    });

    captureEvent("user_action", { action: "test" });
    expect(capture).not.toHaveBeenCalled();

    capturePageView("/sandbox?page=1");
    expect(capture).not.toHaveBeenCalled();
  });
});

describe("groupOrganization", () => {
  afterEach(() => {
    __resetAnalyticsForTests();
    delete process.env[FEATURE_KEY];
    delete process.env[POSTHOG_KEY];
    vi.restoreAllMocks();
  });

  it("no-ops when analytics is not ready", () => {
    const group = vi.fn();
    __setAnalyticsClientForTests({ group } as never);

    groupOrganization("575", { name: "Eastside CC", plan: "trial" });
    expect(group).not.toHaveBeenCalled();
  });

  it("passes allowlisted group properties when ready", () => {
    process.env[FEATURE_KEY] = "true";
    process.env[POSTHOG_KEY] = "phc_test";

    const group = vi.fn();
    __setAnalyticsClientForTests({ group } as never);
    __markAnalyticsInitializedForTests();

    groupOrganization("575", {
      name: "Eastside CC",
      plan: "trial",
      sport: "cricket",
      email: "secret@example.com",
    });

    expect(group).toHaveBeenCalledWith("organization", "575", {
      name: "Eastside CC",
      plan: "trial",
      sport: "cricket",
    });
  });

  it("calls group without properties when allowlist is empty", () => {
    process.env[FEATURE_KEY] = "true";
    process.env[POSTHOG_KEY] = "phc_test";

    const group = vi.fn();
    __setAnalyticsClientForTests({ group } as never);
    __markAnalyticsInitializedForTests();

    groupOrganization("575", { email: "secret@example.com" });
    expect(group).toHaveBeenCalledWith("organization", "575");
  });

  it("clears organization group via resetGroups", () => {
    process.env[FEATURE_KEY] = "true";
    process.env[POSTHOG_KEY] = "phc_test";

    const resetGroups = vi.fn();
    __setAnalyticsClientForTests({ resetGroups } as never);
    __markAnalyticsInitializedForTests();

    clearOrganizationGroup();
    expect(resetGroups).toHaveBeenCalled();
  });
});
