import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { parseAccountMeResponse } from "./parse-account-me-response";

describe("parseAccountMeResponse", () => {
  it("accepts empty accounts as a valid zero-account state", () => {
    expect(
      parseAccountMeResponse({
        data: { user: null, accounts: [], accountId: null },
      }),
    ).toEqual({
      data: { user: null, accounts: [], accountId: null },
    });
  });

  it("accepts two or more valid rows", () => {
    const parsed = parseAccountMeResponse({
      data: {
        user: null,
        accounts: [{ id: 10 }, { id: 20 }],
        accountId: null,
      },
    });
    expect(parsed.data.accounts.map((r) => r.id)).toEqual([10, 20]);
  });

  it("rejects missing accounts instead of treating them as empty", () => {
    expect(() =>
      parseAccountMeResponse({
        data: { user: null, accountId: 99 },
      }),
    ).toThrow(ApiError);
    try {
      parseAccountMeResponse({ data: { user: null } });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toMatch(/accounts must be an array/i);
    }
  });

  it("rejects non-array accounts", () => {
    expect(() =>
      parseAccountMeResponse({
        data: { user: null, accounts: { id: 1 } },
      }),
    ).toThrow(ApiError);
  });

  it("rejects malformed account rows", () => {
    expect(() =>
      parseAccountMeResponse({
        data: { user: null, accounts: [{ name: "no-id" }] },
      }),
    ).toThrow(ApiError);
  });

  it("tolerates null or absent compatibility accountId", () => {
    expect(
      parseAccountMeResponse({
        data: { user: null, accounts: [{ id: 7 }], accountId: null },
      }).data.accounts.map((r) => r.id),
    ).toEqual([7]);
    expect(
      parseAccountMeResponse({
        data: { user: null, accounts: [{ id: 8 }] },
      }).data.accounts.map((r) => r.id),
    ).toEqual([8]);
  });

  it("retains createdAt and theme on parsed account rows", () => {
    const theme = {
      id: 42,
      name: "North Districts Blue",
      isPublic: false,
      theme: { primary: "#003366", secondary: "#FF6600" },
    };
    const parsed = parseAccountMeResponse({
      data: {
        user: null,
        accounts: [
          {
            id: 10,
            createdAt: "2026-07-01T04:12:33.000Z",
            theme,
          },
        ],
      },
    });
    expect(parsed.data.accounts[0]?.createdAt).toBe("2026-07-01T04:12:33.000Z");
    expect(parsed.data.accounts[0]?.theme).toEqual(theme);
  });
});
