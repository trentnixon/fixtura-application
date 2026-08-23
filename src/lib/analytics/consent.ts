import { ANALYTICS_CONSENT_GRANTED, ANALYTICS_CONSENT_STORAGE_KEY } from "./constants";

export function readAnalyticsConsent(storage: { getItem(key: string): string | null }): boolean {
  try {
    return storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === ANALYTICS_CONSENT_GRANTED;
  } catch {
    return false;
  }
}

export function readBrowserAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return readAnalyticsConsent(window.localStorage);
}
