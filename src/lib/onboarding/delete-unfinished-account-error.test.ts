import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { deleteUnfinishedAccountErrorMessage } from "./delete-unfinished-account-error";

describe("deleteUnfinishedAccountErrorMessage", () => {
  it("maps ACCOUNT_DELETE_NOT_ALLOWED with message", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({
        status: 403,
        message: "generic",
        details: { code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "Not allowed by policy." },
      }),
    );
    expect(msg).toBe("Not allowed by policy.");
  });

  it("maps nested error.message", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({
        status: 403,
        message: "generic",
        details: { error: { code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "Nested." } },
      }),
    );
    expect(msg).toBe("Nested.");
  });

  it("uses 404 copy", () => {
    expect(
      deleteUnfinishedAccountErrorMessage(new ApiError({ status: 404, message: "x", details: {} })),
    ).toContain("could not find");
  });

  it("uses default policy copy when ACCOUNT_DELETE_NOT_ALLOWED has no message", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({
        status: 403,
        message: "generic",
        details: { code: "ACCOUNT_DELETE_NOT_ALLOWED" },
      }),
    );
    expect(msg).toContain("cannot be deleted in its current state");
  });

  it("uses 403 copy when no structured details are present", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({ status: 403, message: "Forbidden", details: {} }),
    );
    expect(msg).toContain("Deleting this account is not allowed right now");
  });

  it("returns ApiError message for other status codes", () => {
    expect(
      deleteUnfinishedAccountErrorMessage(new ApiError({ status: 500, message: "Server blew up" })),
    ).toBe("Server blew up");
  });

  it("returns plain Error message", () => {
    expect(deleteUnfinishedAccountErrorMessage(new Error("network down"))).toBe("network down");
  });

  it("returns fallback for unknown errors", () => {
    expect(deleteUnfinishedAccountErrorMessage("oops")).toBe(
      "Could not delete the account. Try again.",
    );
  });

  it("maps flat details.message without code", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({
        status: 400,
        message: "generic",
        details: { message: "Account is locked." },
      }),
    );
    expect(msg).toBe("Account is locked.");
  });

  it("maps nested error.message without ACCOUNT_DELETE_NOT_ALLOWED code", () => {
    const msg = deleteUnfinishedAccountErrorMessage(
      new ApiError({
        status: 400,
        message: "generic",
        details: { error: { code: "OTHER", message: "Nested generic." } },
      }),
    );
    expect(msg).toBe("Nested generic.");
  });
});
