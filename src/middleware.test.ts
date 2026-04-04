import { describe, expect, it } from "vitest";

import { config } from "./middleware";

describe("middleware config", () => {
  it("matcher covers scoped members routes, gateway, and sign-in", () => {
    const m = config.matcher as string[];
    expect(m).toContain("/o/:path*");
    expect(m).toContain("/select-organisation");
    expect(m).toContain("/sign-in");
    expect(m.some((x) => x.includes("dashboard"))).toBe(true);
  });
});
