import { describe, expect, it } from "vitest";

import { getBrandLogoPageHelpRouteFromPathRest } from "./get-brand-logo-page-help-route-from-path";

describe("getBrandLogoPageHelpRouteFromPathRest", () => {
  it("maps the brand logo path", () => {
    expect(getBrandLogoPageHelpRouteFromPathRest("brand-logo")).toBe("brand-logo");
  });

  it("returns null outside the brand logo area", () => {
    expect(getBrandLogoPageHelpRouteFromPathRest("branding")).toBeNull();
    expect(getBrandLogoPageHelpRouteFromPathRest("club-logos")).toBeNull();
    expect(getBrandLogoPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getBrandLogoPageHelpRouteFromPathRest("brand-logo/extra")).toBeNull();
  });
});
