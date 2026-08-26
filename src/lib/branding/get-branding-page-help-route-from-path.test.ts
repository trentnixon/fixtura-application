import { describe, expect, it } from "vitest";

import { getBrandingPageHelpRouteFromPathRest } from "./get-branding-page-help-route-from-path";

describe("getBrandingPageHelpRouteFromPathRest", () => {
  it("maps the branding path", () => {
    expect(getBrandingPageHelpRouteFromPathRest("branding")).toBe("branding");
  });

  it("returns null outside the branding area", () => {
    expect(getBrandingPageHelpRouteFromPathRest("brand-logo")).toBeNull();
    expect(getBrandingPageHelpRouteFromPathRest("club-logos")).toBeNull();
    expect(getBrandingPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getBrandingPageHelpRouteFromPathRest("branding/extra")).toBeNull();
  });
});
