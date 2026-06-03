import { describe, expect, it } from "vitest";

import {
  accountScopedRoutes,
  isValidAccountIdSegment,
  isValidRenderIdSegment,
  parseAccountScopePath,
} from "./account-routes";

describe("account-routes", () => {
  describe("isValidAccountIdSegment", () => {
    it("accepts positive integer strings with reasonable length", () => {
      expect(isValidAccountIdSegment("1")).toBe(true);
      expect(isValidAccountIdSegment("319")).toBe(true);
    });

    it("rejects empty, non-numeric, zero, negative, and overly long segments", () => {
      expect(isValidAccountIdSegment("")).toBe(false);
      expect(isValidAccountIdSegment("abc")).toBe(false);
      expect(isValidAccountIdSegment("0")).toBe(false);
      expect(isValidAccountIdSegment("-1")).toBe(false);
      expect(isValidAccountIdSegment("1".repeat(25))).toBe(false);
    });
  });

  describe("parseAccountScopePath", () => {
    it("parses /o/{id}/rest", () => {
      expect(parseAccountScopePath("/o/12/dashboard")).toEqual({
        accountId: "12",
        rest: "dashboard",
      });
      expect(parseAccountScopePath("/o/12/dashboard/extra")).toEqual({
        accountId: "12",
        rest: "dashboard/extra",
      });
    });

    it("returns null for non-scoped or invalid account segments", () => {
      expect(parseAccountScopePath("/dashboard")).toBeNull();
      expect(parseAccountScopePath("/o/0/dashboard")).toBeNull();
      expect(parseAccountScopePath("/o/abc/dashboard")).toBeNull();
    });
  });

  describe("accountScopedRoutes.bundlesRender", () => {
    it("builds scoped bundles detail URL", () => {
      expect(accountScopedRoutes.bundlesRender(319, 1001)).toBe("/o/319/bundles/1001");
    });
  });

  describe("isValidRenderIdSegment", () => {
    it("matches account id segment rules", () => {
      expect(isValidRenderIdSegment("1001")).toBe(true);
      expect(isValidRenderIdSegment("0")).toBe(false);
    });
  });
});
