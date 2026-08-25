import { describe, expect, it } from "vitest";

import { getClubLogosPageHelpRouteFromPathRest } from "./get-club-logos-page-help-route-from-path";

describe("getClubLogosPageHelpRouteFromPathRest", () => {
  it("maps the club logos directory", () => {
    expect(getClubLogosPageHelpRouteFromPathRest("club-logos")).toBe("directory");
  });

  it("maps a per-club editor path", () => {
    expect(getClubLogosPageHelpRouteFromPathRest("club-logos/99")).toBe("editor");
    expect(getClubLogosPageHelpRouteFromPathRest("club-logos/99/extra")).toBe("editor");
  });

  it("returns null outside the club logos area", () => {
    expect(getClubLogosPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getClubLogosPageHelpRouteFromPathRest("branding")).toBeNull();
    expect(getClubLogosPageHelpRouteFromPathRest("manage-sponsors")).toBeNull();
  });
});
