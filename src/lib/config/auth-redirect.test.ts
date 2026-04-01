import { afterEach, describe, expect, it } from "vitest";

import { getSessionInvalidRedirectUrl, LOGIN_REASON_SESSION } from "./auth-redirect";

describe("getSessionInvalidRedirectUrl", () => {
  const original = process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"];

  afterEach(() => {
    if (original === undefined) {
      delete process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"];
    } else {
      process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"] = original;
    }
  });

  it("appends reason=session when defaulting to /login", () => {
    delete process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"];
    expect(getSessionInvalidRedirectUrl()).toBe(`/login?reason=${LOGIN_REASON_SESSION}`);
  });

  it("merges reason when logout redirect is /login with existing query", () => {
    process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"] = "/login?foo=bar";
    expect(getSessionInvalidRedirectUrl()).toBe(`/login?foo=bar&reason=${LOGIN_REASON_SESSION}`);
  });

  it("does not add reason when redirecting to marketing home", () => {
    process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"] = "/";
    expect(getSessionInvalidRedirectUrl()).toBe("/");
  });
});
