import { afterEach, describe, expect, it } from "vitest";

import {
  buildAnalyticsConsentCookie,
  readAnalyticsConsent,
  readBrowserAnalyticsConsent,
  readCookieAnalyticsConsent,
  resolveAnalyticsConsentCookieDomain,
  writeBrowserAnalyticsConsent,
} from "./consent";
import { ANALYTICS_CONSENT_GRANTED, ANALYTICS_CONSENT_STORAGE_KEY } from "./constants";

describe("readCookieAnalyticsConsent", () => {
  it("returns true when the domain cookie is granted", () => {
    expect(
      readCookieAnalyticsConsent(`other=value; ${ANALYTICS_CONSENT_STORAGE_KEY}=granted`),
    ).toBe(true);
  });

  it("returns false when the cookie is missing or not granted", () => {
    expect(readCookieAnalyticsConsent("")).toBe(false);
    expect(readCookieAnalyticsConsent(`${ANALYTICS_CONSENT_STORAGE_KEY}=denied`)).toBe(false);
  });
});

describe("readBrowserAnalyticsConsent", () => {
  afterEach(() => {
    document.cookie = `${ANALYTICS_CONSENT_STORAGE_KEY}=; Max-Age=0; path=/`;
    window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  });

  it("prefers the domain cookie over localStorage", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "denied");
    document.cookie = `${ANALYTICS_CONSENT_STORAGE_KEY}=${ANALYTICS_CONSENT_GRANTED}; path=/`;

    expect(readBrowserAnalyticsConsent()).toBe(true);
  });

  it("falls back to localStorage when the cookie is absent", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, ANALYTICS_CONSENT_GRANTED);

    expect(readBrowserAnalyticsConsent()).toBe(true);
  });

  it("does not fall back to localStorage when the cookie explicitly denies consent", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, ANALYTICS_CONSENT_GRANTED);
    document.cookie = `${ANALYTICS_CONSENT_STORAGE_KEY}=denied; path=/`;

    expect(readBrowserAnalyticsConsent()).toBe(false);
  });
});

describe("writeBrowserAnalyticsConsent", () => {
  afterEach(() => {
    document.cookie = `${ANALYTICS_CONSENT_STORAGE_KEY}=; Max-Age=0; path=/`;
    window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  });

  it("writes granted consent to localStorage and builds a domain-scoped cookie", () => {
    writeBrowserAnalyticsConsent(ANALYTICS_CONSENT_GRANTED, {
      hostname: "application.fixtura.com.au",
      protocol: "https:",
    });

    expect(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      ANALYTICS_CONSENT_GRANTED,
    );
    expect(
      buildAnalyticsConsentCookie(ANALYTICS_CONSENT_GRANTED, {
        hostname: "application.fixtura.com.au",
        protocol: "https:",
      }),
    ).toContain("domain=.fixtura.com.au");
  });

  it("writes localStorage only on localhost without a domain cookie", () => {
    writeBrowserAnalyticsConsent(ANALYTICS_CONSENT_GRANTED, {
      hostname: "localhost",
      protocol: "http:",
    });

    expect(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      ANALYTICS_CONSENT_GRANTED,
    );
    expect(readCookieAnalyticsConsent(document.cookie)).toBe(false);
  });
});

describe("resolveAnalyticsConsentCookieDomain", () => {
  it("returns the shared Fixtura domain for production hosts", () => {
    expect(resolveAnalyticsConsentCookieDomain("application.fixtura.com.au")).toBe(
      ".fixtura.com.au",
    );
    expect(resolveAnalyticsConsentCookieDomain("www.fixtura.com.au")).toBe(".fixtura.com.au");
  });

  it("returns undefined for local development hosts", () => {
    expect(resolveAnalyticsConsentCookieDomain("localhost")).toBeUndefined();
  });
});

describe("readAnalyticsConsent", () => {
  it("returns true only when localStorage consent is granted", () => {
    const storage = {
      getItem: (key: string) =>
        key === ANALYTICS_CONSENT_STORAGE_KEY ? ANALYTICS_CONSENT_GRANTED : null,
    };

    expect(readAnalyticsConsent(storage)).toBe(true);
  });

  it("returns false when localStorage consent is missing or denied", () => {
    expect(readAnalyticsConsent({ getItem: () => null })).toBe(false);
    expect(readAnalyticsConsent({ getItem: () => "denied" })).toBe(false);
  });
});
