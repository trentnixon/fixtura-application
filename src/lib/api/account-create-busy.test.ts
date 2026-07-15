import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import {
  accountCreateBusyMessage,
  accountCreateBusyRetryAfterSeconds,
  isAccountCreateBusyError,
} from "./account-create-busy";

describe("isAccountCreateBusyError", () => {
  it("matches 503 with nested error.code ACCOUNT_CREATE_BUSY", () => {
    const error = new ApiError({
      status: 503,
      message: "Account creation is busy. Please retry.",
      details: {
        error: {
          code: "ACCOUNT_CREATE_BUSY",
          message: "Account creation is busy. Please retry.",
        },
      },
      retryAfterSeconds: 1,
    });
    expect(isAccountCreateBusyError(error)).toBe(true);
  });

  it("matches 503 with top-level code", () => {
    const error = new ApiError({
      status: 503,
      message: "Busy",
      details: { code: "ACCOUNT_CREATE_BUSY" },
      retryAfterSeconds: 2,
    });
    expect(isAccountCreateBusyError(error)).toBe(true);
  });

  it("rejects other statuses and codes", () => {
    expect(
      isAccountCreateBusyError(
        new ApiError({
          status: 500,
          message: "Server",
          details: { error: { code: "ACCOUNT_CREATE_BUSY" } },
        }),
      ),
    ).toBe(false);

    expect(
      isAccountCreateBusyError(
        new ApiError({
          status: 503,
          message: "Busy",
          details: { error: { code: "OTHER" } },
        }),
      ),
    ).toBe(false);

    expect(isAccountCreateBusyError(new Error("nope"))).toBe(false);
  });
});

describe("accountCreateBusyRetryAfterSeconds / message", () => {
  it("uses retryAfterSeconds when present", () => {
    const error = new ApiError({
      status: 503,
      message: "Busy",
      details: { error: { code: "ACCOUNT_CREATE_BUSY" } },
      retryAfterSeconds: 3,
    });
    expect(accountCreateBusyRetryAfterSeconds(error)).toBe(3);
    expect(accountCreateBusyMessage(error)).toMatch(/3 seconds/);
  });

  it("defaults to 1 second when Retry-After is missing", () => {
    const error = new ApiError({
      status: 503,
      message: "Busy",
      details: { error: { code: "ACCOUNT_CREATE_BUSY" } },
      retryAfterSeconds: null,
    });
    expect(accountCreateBusyRetryAfterSeconds(error)).toBe(1);
    expect(accountCreateBusyMessage(error)).toMatch(/1 second/);
  });
});
