import { describe, expect, it } from "vitest";

import { isSafeAppReturnPath } from "./safe-return-path";

describe("isSafeAppReturnPath", () => {
  it("allows /o/{accountId}/{segment} with positive integer id", () => {
    expect(isSafeAppReturnPath("/o/319/dashboard")).toBe(true);
    expect(isSafeAppReturnPath("/o/1/settings")).toBe(true);
    expect(isSafeAppReturnPath("/o/42/bundles/foo?tab=2")).toBe(true);
  });

  it("rejects invalid account id or unknown segment", () => {
    expect(isSafeAppReturnPath("/o/0/dashboard")).toBe(false);
    expect(isSafeAppReturnPath("/o/abc/dashboard")).toBe(false);
    expect(isSafeAppReturnPath("/o/12/evil-segment")).toBe(false);
    expect(isSafeAppReturnPath("/dashboard")).toBe(false);
  });

  it("rejects non-scoped paths", () => {
    expect(isSafeAppReturnPath("/login")).toBe(false);
    expect(isSafeAppReturnPath("/apple")).toBe(false);
    expect(isSafeAppReturnPath("/")).toBe(false);
  });

  it("rejects open redirects and traversal", () => {
    expect(isSafeAppReturnPath("//evil.com")).toBe(false);
    expect(isSafeAppReturnPath("/o/1/dashboard/../login")).toBe(false);
  });
});
