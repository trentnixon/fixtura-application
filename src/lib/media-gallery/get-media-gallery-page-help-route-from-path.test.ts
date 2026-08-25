import { describe, expect, it } from "vitest";

import { getMediaGalleryPageHelpRouteFromPathRest } from "./get-media-gallery-page-help-route-from-path";

describe("getMediaGalleryPageHelpRouteFromPathRest", () => {
  it("maps the media gallery path", () => {
    expect(getMediaGalleryPageHelpRouteFromPathRest("media-gallery")).toBe("media-gallery");
  });

  it("returns null outside the media gallery area", () => {
    expect(getMediaGalleryPageHelpRouteFromPathRest("template-builder")).toBeNull();
    expect(getMediaGalleryPageHelpRouteFromPathRest("branding")).toBeNull();
    expect(getMediaGalleryPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getMediaGalleryPageHelpRouteFromPathRest("media-gallery/extra")).toBeNull();
  });
});
