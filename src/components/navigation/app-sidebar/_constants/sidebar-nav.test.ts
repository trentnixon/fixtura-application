import { describe, expect, it } from "vitest";

import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { getScopedNavSections } from "./sidebar-nav";

function allNavTitles(accountId: string, options?: Parameters<typeof getScopedNavSections>[1]) {
  return getScopedNavSections(accountId, options).flatMap((section) =>
    section.items.map((item) => item.title),
  );
}

describe("getScopedNavSections", () => {
  const accountId = "42";

  it("includes Vision, Templates, and Club Logos for normal scoped nav", () => {
    const titles = allNavTitles(accountId, { accountType: 2 });
    expect(titles).toContain("Vision");
    expect(titles).toContain("Templates");
    expect(titles).toContain("Club Logos");
  });

  it("hides Vision, Templates, and Club Logos in support view", () => {
    const titles = allNavTitles(accountId, { accountType: 2, isSupportView: true });
    expect(titles).not.toContain("Vision");
    expect(titles).not.toContain("Templates");
    expect(titles).not.toContain("Club Logos");
  });

  it("still exposes read-friendly routes in support view", () => {
    const titles = allNavTitles(accountId, { isSupportView: true });
    expect(titles).toEqual(
      expect.arrayContaining([
        "Dashboard",
        "Billing",
        "Bundles",
        "Settings",
        "Background images",
        "Sort Order",
        "Branding",
        "Logo",
        "Sponsors",
      ]),
    );
  });

  it("omits Club Logos for club accounts even outside support view", () => {
    const titles = allNavTitles(accountId, { accountType: CLUB_ACCOUNT_TYPE_ID });
    expect(titles).not.toContain("Club Logos");
  });
});
