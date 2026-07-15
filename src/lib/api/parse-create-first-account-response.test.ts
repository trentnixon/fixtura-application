import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { parseCreateFirstAccountResponse } from "./parse-create-first-account-response";

describe("parseCreateFirstAccountResponse", () => {
  it("accepts a numeric accountId payload", () => {
    expect(parseCreateFirstAccountResponse({ data: { accountId: 456 } })).toEqual({
      data: { accountId: 456 },
    });
  });

  it("rejects malformed success data without a numeric account id", () => {
    const cases = [
      null,
      {},
      { data: {} },
      { data: { accountId: "456" } },
      { data: { accountId: 0 } },
      { data: { accountId: -1 } },
      { data: null },
    ];
    for (const payload of cases) {
      expect(() => parseCreateFirstAccountResponse(payload)).toThrow(ApiError);
    }
  });
});
