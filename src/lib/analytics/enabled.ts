export function isAnalyticsFeatureFlagEnabled(featureAnalytics: string | undefined): boolean {
  return featureAnalytics === "true";
}

export function isAnalyticsConfigured(env: {
  featureAnalytics?: string;
  posthogKey?: string;
}): boolean {
  return isAnalyticsFeatureFlagEnabled(env.featureAnalytics) && Boolean(env.posthogKey?.trim());
}

export function canCaptureAnalytics(options: {
  configured: boolean;
  initialized: boolean;
}): boolean {
  return options.configured && options.initialized;
}
