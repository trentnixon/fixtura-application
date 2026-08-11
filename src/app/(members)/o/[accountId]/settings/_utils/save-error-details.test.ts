import { describe, expect, it } from "vitest";

import { extraDetailForSaveError, strapiStructuredErrorCode } from "./save-error-details";

describe("strapiStructuredErrorCode", () => {
  it("parses nested error code from ApiError-style details", () => {
    expect(strapiStructuredErrorCode({ error: { code: "EMPTY_UPDATE" } })).toBe("EMPTY_UPDATE");
  });

  it("returns undefined for missing or malformed details", () => {
    expect(strapiStructuredErrorCode(null)).toBeUndefined();
    expect(strapiStructuredErrorCode({ error: { message: "no code" } })).toBeUndefined();
    expect(strapiStructuredErrorCode("string")).toBeUndefined();
  });
});

describe("extraDetailForSaveError", () => {
  it("returns copy for EMPTY_UPDATE", () => {
    expect(extraDetailForSaveError("EMPTY_UPDATE")).toMatch(/Nothing applied/);
  });

  it("returns copy for SCHEDULER_MISSING", () => {
    expect(extraDetailForSaveError("SCHEDULER_MISSING")).toMatch(/no scheduler exists/);
  });

  it("returns undefined for unknown codes", () => {
    expect(extraDetailForSaveError("OTHER")).toBeUndefined();
    expect(extraDetailForSaveError(undefined)).toBeUndefined();
  });
});
