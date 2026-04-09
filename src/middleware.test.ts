import { describe, expect, it } from "vitest";

import { config, isMembersGatewayProtectedPath } from "./middleware";

describe("middleware config", () => {
  it("matcher covers scoped members routes, gateway, and sign-in", () => {
    const m = config.matcher as string[];
    expect(m).toContain("/o/:path*");
    expect(m).toContain("/select-organisation");
    expect(m).toContain("/sign-in");
    expect(m.some((x) => x.includes("dashboard"))).toBe(true);
  });

  it("matcher includes create-organisation nested paths for setup preparation route", () => {
    const m = config.matcher as string[];
    expect(m).toContain("/create-organisation/:path*");
  });
});

describe("isMembersGatewayProtectedPath", () => {
  it("returns true for select-organisation and create-organisation roots", () => {
    expect(isMembersGatewayProtectedPath("/select-organisation")).toBe(true);
    expect(isMembersGatewayProtectedPath("/create-organisation")).toBe(true);
  });

  it("returns true for create-organisation nested paths (e.g. setup preparation)", () => {
    expect(isMembersGatewayProtectedPath("/create-organisation/setup")).toBe(true);
  });

  it("returns false for unrelated paths", () => {
    expect(isMembersGatewayProtectedPath("/sign-in")).toBe(false);
    expect(isMembersGatewayProtectedPath("/o/1/dashboard")).toBe(false);
  });
});
