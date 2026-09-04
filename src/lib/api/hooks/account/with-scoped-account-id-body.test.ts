import { describe, expect, it } from "vitest";

import { withScopedAccountIdBody } from "./with-scoped-account-id-body";

describe("withScopedAccountIdBody", () => {
  it("merges numeric accountId into scrape request bodies", () => {
    expect(withScopedAccountIdBody("700", { clubId: 42 })).toEqual({
      accountId: 700,
      clubId: 42,
    });
  });

  it("throws for invalid account id segments", () => {
    expect(() => withScopedAccountIdBody("bad", { clubId: 42 })).toThrow("Invalid account id");
  });
});
