import { describe, expect, it } from "vitest";

import { accountSummaryFixture } from "@/lib/account/account-summary-fixture";
import { ApiError } from "@/lib/api/client/api-error";

import {
  accountIdPresentInMePayload,
  isDefiniteDeleteFailure,
  isUncertainDeleteOutcome,
} from "./account-delete-outcome";

import type { AccountMePayload } from "@/types/api/account";

describe("isDefiniteDeleteFailure", () => {
  it.each([400, 401, 403, 404])("matches ApiError status %s", (status) => {
    expect(isDefiniteDeleteFailure(new ApiError({ status, message: "x" }))).toBe(true);
  });

  it("rejects uncertain statuses and non-ApiError", () => {
    expect(isDefiniteDeleteFailure(new ApiError({ status: 408, message: "timeout" }))).toBe(false);
    expect(isDefiniteDeleteFailure(new ApiError({ status: 500, message: "server" }))).toBe(false);
    expect(isDefiniteDeleteFailure(new Error("network"))).toBe(false);
  });
});

describe("isUncertainDeleteOutcome", () => {
  it("treats non-ApiError as uncertain", () => {
    expect(isUncertainDeleteOutcome(new Error("network"))).toBe(true);
  });

  it("treats 408 and 5xx as uncertain", () => {
    expect(isUncertainDeleteOutcome(new ApiError({ status: 408, message: "timeout" }))).toBe(true);
    expect(isUncertainDeleteOutcome(new ApiError({ status: 500, message: "server" }))).toBe(true);
    expect(isUncertainDeleteOutcome(new ApiError({ status: 503, message: "busy" }))).toBe(true);
  });

  it("does not treat definite client/CMS failures as uncertain", () => {
    expect(isUncertainDeleteOutcome(new ApiError({ status: 403, message: "no" }))).toBe(false);
    expect(isUncertainDeleteOutcome(new ApiError({ status: 404, message: "gone" }))).toBe(false);
  });
});

describe("accountIdPresentInMePayload", () => {
  const payload: AccountMePayload = {
    accountId: 999,
    user: null,
    accounts: [
      accountSummaryFixture({ id: 123, isActive: true }),
      accountSummaryFixture({ id: 456, isActive: false }),
    ],
  };

  it("finds an owned row by id string", () => {
    expect(accountIdPresentInMePayload(payload, "123")).toBe(true);
    expect(accountIdPresentInMePayload(payload, "456")).toBe(true);
  });

  it("does not use compatibility accountId when rows omit the id", () => {
    expect(accountIdPresentInMePayload(payload, "999")).toBe(false);
  });

  it("returns false for empty id or missing payload", () => {
    expect(accountIdPresentInMePayload(undefined, "123")).toBe(false);
    expect(accountIdPresentInMePayload(payload, "")).toBe(false);
  });
});
