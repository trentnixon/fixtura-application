import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildBrandingPageHelpContent,
  type BrandingPageHelpRoute,
} from "./build-branding-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: BrandingPageHelpRoute) {
  return buildBrandingPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: BrandingPageHelpRoute[] = ["branding"];

describe("buildBrandingPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns branding help with colours, contrast, and save how-tos", () => {
    const content = contentFor("branding");
    expect(content.title).toBe("Branding");
    expect(content.summary.toLowerCase()).toMatch(/colour|color|contrast|graphic|asset|template/);
    expect(content.items.some((item) => item.label === "Brand colours")).toBe(true);
    expect(content.items.some((item) => item.label === "Contrast selector")).toBe(true);
    expect(content.items.some((item) => item.label === "Save branding")).toBe(true);
    expect(content.related.some((r) => r.href === accountScopedRoutes.brandLogo(ACCOUNT_ID))).toBe(
      true,
    );
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.templateBuilder(ACCOUNT_ID)),
    ).toBe(true);
  });

  it("does not attach a visual until screenshots are decided", () => {
    for (const route of ALL_ROUTES) {
      expect(contentFor(route).visual).toBeUndefined();
    }
  });
});
