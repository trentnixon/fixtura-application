import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import {
  ACCOUNT_ACTIVE_NOT_MUTABLE_CODE,
  accountActiveErrorMessage,
  canSetAccountActive,
} from "./account-active";

describe("canSetAccountActive", () => {
  it("allows the switch only when setup and both pipelines are completed", () => {
    expect(
      canSetAccountActive({
        isSetup: true,
        initialSetupStatus: "completed",
        initialDataFetchStatus: "completed",
      }),
    ).toBe(true);
  });

  it("rejects an account that is not set up", () => {
    expect(
      canSetAccountActive({
        isSetup: false,
        initialSetupStatus: "completed",
        initialDataFetchStatus: "completed",
      }),
    ).toBe(false);
  });

  it("rejects an account whose data fetch is not completed", () => {
    expect(
      canSetAccountActive({
        isSetup: true,
        initialSetupStatus: "completed",
        initialDataFetchStatus: "running",
      }),
    ).toBe(false);
  });
});

describe("accountActiveErrorMessage", () => {
  it("branches on ACCOUNT_ACTIVE_NOT_MUTABLE", () => {
    const error = new ApiError({
      status: 409,
      message: "Account is not mutable.",
      details: { error: { code: ACCOUNT_ACTIVE_NOT_MUTABLE_CODE, message: "nope" } },
    });

    expect(accountActiveErrorMessage(error)).toBe(
      "This organisation is still being set up, so its active status cannot be changed yet.",
    );
  });

  it("uses the API message for other errors", () => {
    const error = new ApiError({
      status: 400,
      message: "isActive must be a boolean.",
      details: { error: { code: "INVALID_IS_ACTIVE", message: "isActive must be a boolean." } },
    });

    expect(accountActiveErrorMessage(error)).toBe("isActive must be a boolean.");
  });
});
