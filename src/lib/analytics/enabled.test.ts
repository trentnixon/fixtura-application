import { describe, expect, it } from "vitest";

import { canCaptureAnalytics, isAnalyticsConfigured } from "./enabled";

describe("analytics enabled", () => {
  it("requires feature flag and posthog key", () => {
    expect(isAnalyticsConfigured({ featureAnalytics: "true", posthogKey: "phc_test" })).toBe(true);
    expect(isAnalyticsConfigured({ featureAnalytics: "false", posthogKey: "phc_test" })).toBe(
      false,
    );
    expect(isAnalyticsConfigured({ featureAnalytics: "true", posthogKey: "" })).toBe(false);
  });

  it("requires configured, consent, and initialized state to capture", () => {
    expect(canCaptureAnalytics({ configured: true, hasConsent: true, initialized: true })).toBe(
      true,
    );
    expect(canCaptureAnalytics({ configured: false, hasConsent: true, initialized: true })).toBe(
      false,
    );
  });
});
