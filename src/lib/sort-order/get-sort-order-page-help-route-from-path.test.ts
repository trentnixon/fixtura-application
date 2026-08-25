import { describe, expect, it } from "vitest";

import { getSortOrderPageHelpRouteFromPathRest } from "./get-sort-order-page-help-route-from-path";

describe("getSortOrderPageHelpRouteFromPathRest", () => {
  it("maps the sort order path", () => {
    expect(getSortOrderPageHelpRouteFromPathRest("sort-order")).toBe("sort-order");
  });

  it("returns null outside the sort order area", () => {
    expect(getSortOrderPageHelpRouteFromPathRest("template-builder")).toBeNull();
    expect(getSortOrderPageHelpRouteFromPathRest("media-gallery")).toBeNull();
    expect(getSortOrderPageHelpRouteFromPathRest("dashboard")).toBeNull();
    expect(getSortOrderPageHelpRouteFromPathRest("sort-order/extra")).toBeNull();
  });
});
