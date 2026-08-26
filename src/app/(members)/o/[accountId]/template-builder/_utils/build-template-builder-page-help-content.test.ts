import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildTemplateBuilderPageHelpContent,
  type TemplateBuilderPageHelpRoute,
} from "./build-template-builder-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: TemplateBuilderPageHelpRoute) {
  return buildTemplateBuilderPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: TemplateBuilderPageHelpRoute[] = ["template-builder"];

describe("buildTemplateBuilderPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns template builder help with rail steps and save how-tos", () => {
    const content = contentFor("template-builder");
    expect(content.title).toBe("Templates");
    expect(content.summary.toLowerCase()).toMatch(/graphic|template|asset|save/);
    expect(content.items.some((item) => item.label === "1. Template")).toBe(true);
    expect(content.items.some((item) => item.label === "2. Color pairing")).toBe(true);
    expect(content.items.some((item) => item.label === "3. Contrast")).toBe(true);
    expect(content.items.some((item) => item.label === "4. Background")).toBe(true);
    expect(content.items.some((item) => item.label === "Save changes")).toBe(true);
    expect(content.related.some((r) => r.href === accountScopedRoutes.branding(ACCOUNT_ID))).toBe(
      true,
    );
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.mediaGallery(ACCOUNT_ID)),
    ).toBe(true);
  });

  it("does not attach a visual until screenshots are decided", () => {
    for (const route of ALL_ROUTES) {
      expect(contentFor(route).visual).toBeUndefined();
    }
  });
});
