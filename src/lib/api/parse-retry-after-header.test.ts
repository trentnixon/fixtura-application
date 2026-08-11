import { describe, expect, it } from "vitest";

import { parseRetryAfterHeader } from "./parse-retry-after-header";

describe("parseRetryAfterHeader", () => {
  it("parses integer seconds", () => {
    expect(parseRetryAfterHeader("1")).toBe(1);
    expect(parseRetryAfterHeader("0")).toBe(0);
    expect(parseRetryAfterHeader(" 12 ")).toBe(12);
  });

  it("returns null for missing or empty values", () => {
    expect(parseRetryAfterHeader(null)).toBeNull();
    expect(parseRetryAfterHeader(undefined)).toBeNull();
    expect(parseRetryAfterHeader("")).toBeNull();
    expect(parseRetryAfterHeader("   ")).toBeNull();
  });

  it("parses HTTP-date defensively relative to now", () => {
    const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
    const later = "Wed, 21 Oct 2015 07:28:05 GMT";
    expect(parseRetryAfterHeader(later, now)).toBe(5);
  });

  it("clamps past HTTP-date to 0", () => {
    const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
    const earlier = "Wed, 21 Oct 2015 07:27:00 GMT";
    expect(parseRetryAfterHeader(earlier, now)).toBe(0);
  });

  it("returns null for unparseable values", () => {
    expect(parseRetryAfterHeader("soon")).toBeNull();
  });
});
