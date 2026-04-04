import { describe, expect, it } from "vitest";

import { applySignInRedirectQuery } from "./member-route-sign-in";

describe("applySignInRedirectQuery", () => {
  it("sets from to safe scoped path and adds reason=continue", () => {
    const url = new URL("http://localhost/sign-in");
    applySignInRedirectQuery(url, "/o/319/dashboard", "");
    expect(url.searchParams.get("from")).toBe("/o/319/dashboard");
    expect(url.searchParams.get("reason")).toBe("continue");
  });

  it("preserves query on from when path+search is safe", () => {
    const url = new URL("http://localhost/sign-in");
    applySignInRedirectQuery(url, "/o/1/bundles", "?tab=2");
    expect(url.searchParams.get("from")).toBe("/o/1/bundles?tab=2");
    expect(url.searchParams.get("reason")).toBe("continue");
  });

  it("falls back to select-organisation when path is not a safe return path", () => {
    const url = new URL("http://localhost/sign-in");
    applySignInRedirectQuery(url, "/evil", "");
    expect(url.searchParams.get("from")).toBe("/select-organisation");
    expect(url.searchParams.get("reason")).toBeNull();
  });
});
