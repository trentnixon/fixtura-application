import { describe, expect, it, vi } from "vitest";

import { readAnalyticsConsent } from "./consent";
import { ANALYTICS_CONSENT_GRANTED, ANALYTICS_CONSENT_STORAGE_KEY } from "./constants";
import { canCaptureAnalytics, isAnalyticsConfigured } from "./enabled";

describe("analytics consent", () => {
  it("returns true only when consent is granted", () => {
    const storage = {
      getItem: vi.fn((key: string) =>
        key === ANALYTICS_CONSENT_STORAGE_KEY ? ANALYTICS_CONSENT_GRANTED : null,
      ),
    };

    expect(readAnalyticsConsent(storage)).toBe(true);
  });

  it("returns false when consent is missing or denied", () => {
    const storage = { getItem: vi.fn(() => "denied") };
    expect(readAnalyticsConsent(storage)).toBe(false);
  });
});

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
