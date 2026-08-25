import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  buildClubLogosPageHelpContent,
  type ClubLogosPageHelpRoute,
} from "./build-club-logos-page-help-content";

const ACCOUNT_ID = "42";

function contentFor(route: ClubLogosPageHelpRoute) {
  return buildClubLogosPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
  });
}

const ALL_ROUTES: ClubLogosPageHelpRoute[] = ["directory", "editor"];

describe("buildClubLogosPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns directory help with add and replace how-tos", () => {
    const content = contentFor("directory");
    expect(content.title).toBe("Club logos");
    expect(content.summary.toLowerCase()).toMatch(/logo|graphic|club/);
    expect(content.items.some((item) => item.label === "Add logo")).toBe(true);
    expect(content.items.some((item) => item.label === "Replace logo")).toBe(true);
    expect(content.related.some((r) => r.href === accountScopedRoutes.branding(ACCOUNT_ID))).toBe(
      true,
    );
  });

  it("returns editor help with upload and save how-tos", () => {
    const content = contentFor("editor");
    expect(content.title.toLowerCase()).toMatch(/club logo/);
    expect(content.summary.toLowerCase()).toMatch(/upload|crop|club|brand/);
    expect(content.items.some((item) => /upload/i.test(item.label))).toBe(true);
    expect(content.items.some((item) => /save/i.test(item.label))).toBe(true);
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
