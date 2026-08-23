import { readBrowserAnalyticsConsent } from "./consent";
import { canCaptureAnalytics, isAnalyticsConfigured } from "./enabled";
import { buildPostHogInitOptions, createPostHogClient, type PostHogLike } from "./posthog-client";
import { withAppSurface } from "./properties";

let initialized = false;
let client: PostHogLike | null = null;

function readRuntimeEnv(): { featureAnalytics?: string; posthogKey?: string } {
  const featureAnalytics = process.env["NEXT_PUBLIC_FEATURE_ANALYTICS"];
  const posthogKey = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
  return {
    ...(featureAnalytics !== undefined ? { featureAnalytics } : {}),
    ...(posthogKey !== undefined ? { posthogKey } : {}),
  };
}

function getClient(): PostHogLike {
  client ??= createPostHogClient();
  return client;
}

function isReadyToCapture(): boolean {
  const env = readRuntimeEnv();
  return canCaptureAnalytics({
    configured: isAnalyticsConfigured(env),
    hasConsent: readBrowserAnalyticsConsent(),
    initialized,
  });
}

export function initAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  if (initialized) return true;

  const env = readRuntimeEnv();
  if (!isAnalyticsConfigured(env)) return false;
  if (!readBrowserAnalyticsConsent()) return false;

  const key = env.posthogKey?.trim();
  if (!key) return false;

  getClient().init(key, buildPostHogInitOptions());
  initialized = true;
  return true;
}

export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (!isReadyToCapture()) return;
  getClient().capture(event, withAppSurface(properties));
}

export function capturePageView(path: string): void {
  captureEvent("$pageview", { $current_url: path });
}

export function captureConversion(name: string, properties?: Record<string, unknown>): void {
  captureEvent("conversion", { name, ...properties });
}

export function identifyUser(userId: string): void {
  if (!userId.trim()) return;
  if (!isReadyToCapture()) return;
  getClient().identify(userId.trim());
}

export function groupOrganization(accountId: string): void {
  if (!accountId.trim()) return;
  if (!isReadyToCapture()) return;
  getClient().group("organization", accountId.trim());
}

export function clearOrganizationGroup(): void {
  if (!isReadyToCapture()) return;
  getClient().resetGroups?.();
}

export function resetAnalytics(): void {
  if (!initialized) return;
  getClient().reset();
  initialized = false;
}

/** Test-only reset for analytics singleton state. */
export function __resetAnalyticsForTests(): void {
  initialized = false;
  client = null;
}

export function __setAnalyticsClientForTests(mock: PostHogLike): void {
  client = mock;
  initialized = true;
}

export function __markAnalyticsInitializedForTests(): void {
  initialized = true;
}
