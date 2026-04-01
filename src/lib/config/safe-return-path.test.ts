import { describe, expect, it } from "vitest";

import { isSafeAppReturnPath } from "./safe-return-path";

describe("isSafeAppReturnPath", () => {
  it("allows /app and /app/... with optional query", () => {
    expect(isSafeAppReturnPath("/app")).toBe(true);
    expect(isSafeAppReturnPath("/app/home")).toBe(true);
    expect(isSafeAppReturnPath("/app/foo?tab=2")).toBe(true);
  });

  it("rejects non-app paths", () => {
    expect(isSafeAppReturnPath("/login")).toBe(false);
    expect(isSafeAppReturnPath("/apple")).toBe(false);
    expect(isSafeAppReturnPath("/")).toBe(false);
  });

  it("rejects open redirects and traversal", () => {
    expect(isSafeAppReturnPath("//evil.com")).toBe(false);
    expect(isSafeAppReturnPath("/app/../login")).toBe(false);
  });
});
