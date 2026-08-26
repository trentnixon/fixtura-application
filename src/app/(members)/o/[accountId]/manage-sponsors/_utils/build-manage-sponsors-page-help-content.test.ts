import { describe, expect, it } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import {
  buildManageSponsorsPageHelpContent,
  type ManageSponsorsPageHelpRoute,
} from "./build-manage-sponsors-page-help-content";
import { getSponsorAssignmentTargetCopy } from "./sponsor-assignment-target-copy";

const ACCOUNT_ID = "42";

const clubTarget = getSponsorAssignmentTargetCopy({
  account_type: CLUB_ACCOUNT_TYPE_ID,
  group_assets_by: false,
});

function contentFor(route: ManageSponsorsPageHelpRoute, targetCopy = clubTarget) {
  return buildManageSponsorsPageHelpContent({
    route,
    accountId: ACCOUNT_ID,
    targetCopy,
  });
}

const ALL_ROUTES: ManageSponsorsPageHelpRoute[] = [
  "pool",
  "add-sponsor",
  "assign-position",
  "assign-entity",
  "archive",
];

describe("buildManageSponsorsPageHelpContent", () => {
  it.each(ALL_ROUTES)("includes a short summary and on-page how-tos for %s", (route) => {
    const content = contentFor(route);
    expect(content.summary.length).toBeGreaterThan(20);
    expect(content.summary.length).toBeLessThan(280);
    expect(content.items.length).toBeGreaterThanOrEqual(2);
    expect(content.items.every((item) => item.howTo.length > 10)).toBe(true);
  });

  it("returns pool-focused help with actionable page items", () => {
    const content = contentFor("pool");
    expect(content.title).toBe("Sponsor pool");
    expect(content.summary.toLowerCase()).toMatch(/logo|graphic|pool/);
    expect(content.items.some((item) => /add sponsor/i.test(item.label))).toBe(true);
    expect(content.related.map((r) => r.href)).toEqual(
      expect.arrayContaining([
        accountScopedRoutes.addSponsor(ACCOUNT_ID),
        accountScopedRoutes.manageSponsorsAssignPosition(ACCOUNT_ID),
      ]),
    );
  });

  it("returns add-sponsor help with an upload how-to", () => {
    const content = contentFor("add-sponsor");
    expect(content.title).toBe("Add a sponsor");
    expect(content.items.some((item) => /upload|logo/i.test(item.label))).toBe(true);
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.manageSponsors(ACCOUNT_ID)),
    ).toBe(true);
  });

  it("returns assign-position help about account-wide positions", () => {
    const content = contentFor("assign-position");
    expect(content.title).toMatch(/position/i);
    expect(content.summary.toLowerCase()).toMatch(/primary|general|layout|graphic/);
    expect(
      content.related.some(
        (r) => r.href === accountScopedRoutes.manageSponsorsAssignEntity(ACCOUNT_ID),
      ),
    ).toBe(true);
  });

  it("uses team wording on assign-entity for club accounts", () => {
    const content = contentFor("assign-entity");
    expect(content.title.toLowerCase()).toContain("team");
    expect(content.summary.toLowerCase()).toContain("team");
    expect(content.items.some((item) => /team/i.test(item.label) || /team/i.test(item.howTo))).toBe(
      true,
    );
  });

  it("uses competition wording on assign-entity when grouped by competition", () => {
    const targetCopy = getSponsorAssignmentTargetCopy({
      account_type: 2,
      group_assets_by: true,
    });
    const content = contentFor("assign-entity", targetCopy);
    expect(content.title.toLowerCase()).toContain("competition");
    expect(content.summary.toLowerCase()).toContain("competition");
  });

  it("uses grade wording on assign-entity for association accounts without competition grouping", () => {
    const targetCopy = getSponsorAssignmentTargetCopy({
      account_type: 2,
      group_assets_by: false,
    });
    const content = contentFor("assign-entity", targetCopy);
    expect(content.title.toLowerCase()).toContain("grade");
    expect(content.summary.toLowerCase()).toContain("grade");
  });

  it("returns archive help about removing sponsors from the pool", () => {
    const content = contentFor("archive");
    expect(content.title.toLowerCase()).toContain("archive");
    expect(content.summary.toLowerCase()).toMatch(/pool|graphic|asset/);
    expect(
      content.related.some((r) => r.href === accountScopedRoutes.manageSponsors(ACCOUNT_ID)),
    ).toBe(true);
  });

  it("does not attach a visual until screenshots are decided", () => {
    for (const route of ALL_ROUTES) {
      expect(contentFor(route).visual).toBeUndefined();
    }
  });
});
