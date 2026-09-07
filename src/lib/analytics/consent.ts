import {
  ANALYTICS_CONSENT_COOKIE_DOMAIN,
  ANALYTICS_CONSENT_GRANTED,
  ANALYTICS_CONSENT_STORAGE_KEY,
} from "./constants";

export function resolveAnalyticsConsentCookieDomain(hostname: string): string | undefined {
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return undefined;
  }

  if (hostname === "fixtura.com.au" || hostname.endsWith(".fixtura.com.au")) {
    return ANALYTICS_CONSENT_COOKIE_DOMAIN;
  }

  return undefined;
}

export function readCookieAnalyticsConsent(cookieHeader: string): boolean {
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const name = cookie.slice(0, separatorIndex);
    const value = decodeURIComponent(cookie.slice(separatorIndex + 1));
    if (name === ANALYTICS_CONSENT_STORAGE_KEY) {
      return value === ANALYTICS_CONSENT_GRANTED;
    }
  }

  return false;
}

export function readAnalyticsConsent(storage: { getItem(key: string): string | null }): boolean {
  try {
    return storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === ANALYTICS_CONSENT_GRANTED;
  } catch {
    return false;
  }
}

export function readBrowserAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

  if (readCookieAnalyticsConsent(document.cookie)) {
    return true;
  }

  return readAnalyticsConsent(window.localStorage);
}

interface WriteBrowserAnalyticsConsentContext {
  hostname: string;
  protocol: string;
}

export function buildAnalyticsConsentCookie(
  value: typeof ANALYTICS_CONSENT_GRANTED,
  context: WriteBrowserAnalyticsConsentContext,
): string | null {
  const cookieDomain = resolveAnalyticsConsentCookieDomain(context.hostname);
  if (!cookieDomain) return null;

  const secure = context.protocol === "https:" ? "; Secure" : "";
  return `${ANALYTICS_CONSENT_STORAGE_KEY}=${encodeURIComponent(value)}; domain=${cookieDomain}; path=/; SameSite=Lax${secure}; Max-Age=31536000`;
}

export function writeBrowserAnalyticsConsent(
  value: typeof ANALYTICS_CONSENT_GRANTED,
  context: WriteBrowserAnalyticsConsentContext = {
    hostname: typeof window !== "undefined" ? window.location.hostname : "localhost",
    protocol: typeof window !== "undefined" ? window.location.protocol : "http:",
  },
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value);
  } catch {
    // Ignore quota or privacy-mode failures; cookie may still be written.
  }

  const cookie = buildAnalyticsConsentCookie(value, context);
  if (cookie) {
    document.cookie = cookie;
  }
}
