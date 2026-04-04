import { describe, expect, it } from "vitest";

import { accountPickerRowsFromMePayload } from "./account-me-rows";

describe("accountPickerRowsFromMePayload", () => {
  it("returns empty when payload is undefined", () => {
    expect(accountPickerRowsFromMePayload(undefined)).toEqual([]);
  });

  it("prefers accounts[] when present", () => {
    const rows = accountPickerRowsFromMePayload({
      accountId: 1,
      user: null,
      contentHub: {},
      accounts: [
        { id: 2, contentHub: {} },
        { id: 3, contentHub: {} },
      ],
    });
    expect(rows.map((r) => r.id)).toEqual([2, 3]);
  });

  it("falls back to legacy accountId when accounts is empty", () => {
    const rows = accountPickerRowsFromMePayload({
      accountId: 99,
      user: null,
      contentHub: { FirstName: "A" },
      accounts: [],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(99);
    expect(rows[0]?.contentHub).toEqual({ FirstName: "A" });
  });
});
