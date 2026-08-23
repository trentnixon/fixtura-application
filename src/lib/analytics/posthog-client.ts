import posthog from "posthog-js";

import { POSTHOG_API_HOST, POSTHOG_UI_HOST } from "./constants";

export interface PostHogLike {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  group: (groupType: string, groupKey: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  resetGroups?: () => void;
}

export function createPostHogClient(): PostHogLike {
  return posthog as PostHogLike;
}

export function buildPostHogInitOptions(): Record<string, unknown> {
  return {
    api_host: POSTHOG_API_HOST,
    ui_host: POSTHOG_UI_HOST,
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    persistence: "localStorage+cookie",
    disable_session_recording: true,
  };
}
