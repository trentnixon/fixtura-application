import { describe, expect, it } from "vitest";

import { isSafeAppReturnPath } from "./safe-return-path";

describe("isSafeAppReturnPath", () => {
  it("allows /dashboard and /dashboard/... with optional query", () => {
    expect(isSafeAppReturnPath("/dashboard")).toBe(true);
    expect(isSafeAppReturnPath("/dashboard/home")).toBe(true);
    expect(isSafeAppReturnPath("/dashboard/foo?tab=2")).toBe(true);
  });

  it("rejects non-app paths", () => {
    expect(isSafeAppReturnPath("/login")).toBe(false);
    expect(isSafeAppReturnPath("/apple")).toBe(false);
    expect(isSafeAppReturnPath("/")).toBe(false);
  });

  it("rejects open redirects and traversal", () => {
    expect(isSafeAppReturnPath("//evil.com")).toBe(false);
    expect(isSafeAppReturnPath("/dashboard/../login")).toBe(false);
  });
});
