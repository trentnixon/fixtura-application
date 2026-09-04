import { describe, expect, it } from "vitest";

import { buildPostHogInitOptions } from "./posthog-client";

describe("buildPostHogInitOptions", () => {
  it("uses the ingest proxy, PostHog defaults snapshot, and explicit capture settings", () => {
    expect(buildPostHogInitOptions()).toEqual({
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-05-30",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      persistence: "localStorage+cookie",
      disable_session_recording: true,
    });
  });
});
