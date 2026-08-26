import { describe, expect, it } from "vitest";

import { getSponsorsPageHelpRouteFromPathRest } from "./get-sponsors-page-help-route-from-path";

describe("getSponsorsPageHelpRouteFromPathRest", () => {
  it("maps pool and nested sponsor routes", () => {
    expect(getSponsorsPageHelpRouteFromPathRest("manage-sponsors")).toBe("pool");
    expect(getSponsorsPageHelpRouteFromPathRest("manage-sponsors/assign/position")).toBe(
      "assign-position",
    );
    expect(getSponsorsPageHelpRouteFromPathRest("manage-sponsors/assign/entity")).toBe(
      "assign-entity",
    );
    expect(getSponsorsPageHelpRouteFromPathRest("manage-sponsors/archive")).toBe("archive");
    expect(getSponsorsPageHelpRouteFromPathRest("add-sponsor")).toBe("add-sponsor");
  });

  it("returns null outside the sponsors area", () => {
    expect(getSponsorsPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getSponsorsPageHelpRouteFromPathRest("billing")).toBeNull();
  });
});
