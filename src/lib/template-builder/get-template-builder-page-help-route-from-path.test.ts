import { describe, expect, it } from "vitest";

import { getTemplateBuilderPageHelpRouteFromPathRest } from "./get-template-builder-page-help-route-from-path";

describe("getTemplateBuilderPageHelpRouteFromPathRest", () => {
  it("maps the template builder path", () => {
    expect(getTemplateBuilderPageHelpRouteFromPathRest("template-builder")).toBe(
      "template-builder",
    );
  });

  it("returns null outside the template builder area", () => {
    expect(getTemplateBuilderPageHelpRouteFromPathRest("branding")).toBeNull();
    expect(getTemplateBuilderPageHelpRouteFromPathRest("media-gallery")).toBeNull();
    expect(getTemplateBuilderPageHelpRouteFromPathRest("sort-order")).toBeNull();
    expect(getTemplateBuilderPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getTemplateBuilderPageHelpRouteFromPathRest("template-builder/extra")).toBeNull();
  });
});
