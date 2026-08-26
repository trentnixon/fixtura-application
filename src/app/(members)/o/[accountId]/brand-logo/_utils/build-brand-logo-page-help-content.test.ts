import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildBrandLogoPageHelpContent,
  type BrandLogoPageHelpRoute,
} from "./build-brand-logo-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: BrandLogoPageHelpRoute) {
  return buildBrandLogoPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: BrandLogoPageHelpRoute[] = ["brand-logo"];

describe("buildBrandLogoPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns brand logo help with upload, save, and remove how-tos", () => {
    const content = contentFor("brand-logo");
    expect(content.title).toBe("Brand logo");
    expect(content.summary.toLowerCase()).toMatch(/logo|organisation|asset|graphic/);
    expect(content.items.some((item) => item.label === "Upload logo")).toBe(true);
    expect(content.items.some((item) => item.label === "Save logo")).toBe(true);
    expect(content.items.some((item) => item.label === "Remove logo")).toBe(true);
    expect(content.related.some((r) => r.href === accountScopedRoutes.branding(ACCOUNT_ID))).toBe(
      true,
    );
    expect(content.related.some((r) => r.href === accountScopedRoutes.clubLogos(ACCOUNT_ID))).toBe(
      true,
    );
  });

  it("does not attach a visual until screenshots are decided", () => {
    for (const route of ALL_ROUTES) {
      expect(contentFor(route).visual).toBeUndefined();
    }
  });
});
