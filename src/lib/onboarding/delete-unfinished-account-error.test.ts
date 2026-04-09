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
});
