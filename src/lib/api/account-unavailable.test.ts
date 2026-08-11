import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { accountUnavailableResult, isAccountUnavailableError } from "./account-unavailable";

describe("isAccountUnavailableError", () => {
  it("matches structured ACCOUNT_NOT_FOUND on account-scoped 404", () => {
    const error = new ApiError({
      status: 404,
      message: "Account not found.",
      details: { error: { code: "ACCOUNT_NOT_FOUND", message: "Account not found." } },
    });
    expect(isAccountUnavailableError(error, { resource: "account" })).toBe(true);
    expect(accountUnavailableResult(error, { resource: "account" })).toEqual({
      unavailable: true,
      reason: "account_not_found",
    });
  });

  it("matches legacy account-scoped 404 without structured code", () => {
    const error = new ApiError({
      status: 404,
      message: "Account not found",
      details: { message: "Account not found" },
    });
    expect(isAccountUnavailableError(error, { resource: "account" })).toBe(true);
  });

  it("does not match nested-resource 404 (render not found)", () => {
    const error = new ApiError({
      status: 404,
      message: "Render not found",
      details: { error: { code: "RENDER_NOT_FOUND", message: "Render not found" } },
    });
    expect(isAccountUnavailableError(error, { resource: "account" })).toBe(false);
    expect(isAccountUnavailableError(error, { resource: "nested" })).toBe(false);
  });

  it("does not match non-404 errors", () => {
    const error = new ApiError({
      status: 403,
      message: "Forbidden",
      details: { error: { code: "ACCOUNT_NOT_FOUND" } },
    });
    expect(isAccountUnavailableError(error, { resource: "account" })).toBe(false);
  });
});
