import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildMediaGalleryPageHelpContent,
  type MediaGalleryPageHelpRoute,
} from "./build-media-gallery-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: MediaGalleryPageHelpRoute) {
  return buildMediaGalleryPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: MediaGalleryPageHelpRoute[] = ["media-gallery"];

describe("buildMediaGalleryPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns background images help with view, filters, upload, and edit how-tos", () => {
    const content = contentFor("media-gallery");
    expect(content.title).toBe("Background images");
    expect(content.summary.toLowerCase()).toMatch(/background|image|asset|graphic/);
    expect(content.items.some((item) => item.label === "Image pool")).toBe(true);
    expect(content.items.some((item) => item.label === "Filters")).toBe(true);
    expect(content.items.some((item) => item.label === "Upload background")).toBe(true);
    expect(content.items.some((item) => item.label === "Edit")).toBe(true);
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.templateBuilder(ACCOUNT_ID)),
    ).toBe(true);
    expect(content.related.some((r) => r.href === accountScopedRoutes.branding(ACCOUNT_ID))).toBe(
      true,
    );
  });

  it("does not attach a visual until screenshots are decided", () => {
    for (const route of ALL_ROUTES) {
      expect(contentFor(route).visual).toBeUndefined();
    }
  });
});
