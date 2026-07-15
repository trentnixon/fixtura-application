import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { parseDeleteAccountResponse } from "./parse-delete-account-response";

describe("parseDeleteAccountResponse", () => {
  it("accepts deleted true with a numeric accountId", () => {
    expect(parseDeleteAccountResponse({ data: { accountId: 456, deleted: true } })).toEqual({
      data: { accountId: 456, deleted: true },
    });
  });

  it("accepts when expectedAccountId matches", () => {
    expect(parseDeleteAccountResponse({ data: { accountId: 123, deleted: true } }, "123")).toEqual({
      data: { accountId: 123, deleted: true },
    });
  });

  it("rejects when expectedAccountId does not match", () => {
    expect(() =>
      parseDeleteAccountResponse({ data: { accountId: 123, deleted: true } }, "999"),
    ).toThrow(ApiError);
  });

  it("rejects malformed success data", () => {
    const cases = [
      null,
      {},
      { data: {} },
      { data: { accountId: 456 } },
      { data: { accountId: 456, deleted: false } },
      { data: { accountId: "456", deleted: true } },
      { data: { accountId: 0, deleted: true } },
      { data: { accountId: -1, deleted: true } },
      { data: null },
    ];
    for (const payload of cases) {
      expect(() => parseDeleteAccountResponse(payload)).toThrow(ApiError);
    }
  });
});
