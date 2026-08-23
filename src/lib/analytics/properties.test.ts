import { describe, expect, it } from "vitest";

import { withAppSurface } from "./properties";

describe("withAppSurface", () => {
  it("always injects surface app and strips sensitive keys", () => {
    expect(
      withAppSurface({
        accountId: "575",
        email: "secret@example.com",
        password: "nope",
      }),
    ).toEqual({
      surface: "app",
      accountId: "575",
    });
  });
});
