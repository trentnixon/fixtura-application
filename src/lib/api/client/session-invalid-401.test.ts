import { describe, expect, it } from "vitest";

import { shouldHandle401AsSessionInvalid } from "./session-invalid-401";

describe("shouldHandle401AsSessionInvalid", () => {
  it("returns false for login credential failures", () => {
    expect(shouldHandle401AsSessionInvalid("/api/auth/login")).toBe(false);
  });

  it("returns true for protected API routes", () => {
    expect(shouldHandle401AsSessionInvalid("/api/auth/me")).toBe(true);
    expect(shouldHandle401AsSessionInvalid("/api/accounts/1/settings")).toBe(true);
  });
});
