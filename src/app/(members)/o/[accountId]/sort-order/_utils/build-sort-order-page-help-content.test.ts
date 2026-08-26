import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildSortOrderPageHelpContent,
  type SortOrderPageHelpRoute,
} from "./build-sort-order-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: SortOrderPageHelpRoute) {
  return buildSortOrderPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: SortOrderPageHelpRoute[] = ["sort-order"];

describe("buildSortOrderPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns sort order help with drag, save, and default how-tos", () => {
    const content = contentFor("sort-order");
    expect(content.title).toBe("Sort Order");
    expect(content.summary.toLowerCase()).toMatch(/grade|order|graphic|asset/);
    expect(content.items.some((item) => item.label === "Drag grades")).toBe(true);
    expect(content.items.some((item) => item.label === "Save order")).toBe(true);
    expect(content.items.some((item) => item.label === "Use default ordering")).toBe(true);
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.templateBuilder(ACCOUNT_ID)),
    ).toBe(true);
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
