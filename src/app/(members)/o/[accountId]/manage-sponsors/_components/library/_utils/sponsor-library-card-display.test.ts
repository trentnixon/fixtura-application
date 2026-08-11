import { describe, expect, it } from "vitest";

import {
  getSponsorLibraryPlacementBadge,
  getSponsorLibraryStatusBadges,
} from "./sponsor-library-card-display";
import { POSITION_ALLOCATION_CATEGORY } from "../../../_constants/sponsor-position-slots";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

function baseSponsor(
  overrides: Partial<ManageSponsorsWorkspaceSponsor> = {},
): ManageSponsorsWorkspaceSponsor {
  return {
    id: 1,
    name: "Acme Sports",
    tagline: null,
    description: null,
    url: null,
    startDate: null,
    endDate: null,
    isActive: true,
    isPrimary: false,
    rank: null,
    hasLogo: true,
    logoUrl: "https://example.com/logo.png",
    logoAlt: "Acme Sports",
    sponsorshipAllocations: [],
    allocationCount: 0,
    placementLabel: "Unassigned",
    usageLabel: "Pool only",
    isDraft: false,
    ...overrides,
  };
}

describe("getSponsorLibraryPlacementBadge", () => {
  it("marks pool-only sponsors as Unassigned", () => {
    expect(getSponsorLibraryPlacementBadge(baseSponsor()).label).toBe("Unassigned");
  });

  it("describes position slot allocations", () => {
    const sponsor = baseSponsor({
      sponsorshipAllocations: [
        {
          id: 10,
          allocation: {
            accountGroup: {
              category: POSITION_ALLOCATION_CATEGORY,
              id: "primary_sponsor",
              level: "Primary sponsor 1",
              name: "Primary sponsor 1",
            },
          },
        },
      ],
      allocationCount: 1,
    });

    expect(getSponsorLibraryPlacementBadge(sponsor).label).toBe("1 position");
  });

  it("describes entity assignments", () => {
    const sponsor = baseSponsor({
      sponsorshipAllocations: [
        {
          id: 11,
          allocation: { entity: { type: "grade", id: 42 } },
        },
        {
          id: 12,
          allocation: { entity: { type: "grade", id: 43 } },
        },
      ],
      allocationCount: 2,
    });

    expect(getSponsorLibraryPlacementBadge(sponsor).label).toBe("2 assignments");
  });

  it("combines positions and assignments", () => {
    const sponsor = baseSponsor({
      sponsorshipAllocations: [
        {
          id: 10,
          allocation: {
            accountGroup: {
              category: POSITION_ALLOCATION_CATEGORY,
              id: "primary_sponsor",
              level: "Primary sponsor 1",
              name: "Primary sponsor 1",
            },
          },
        },
        {
          id: 11,
          allocation: { entity: { type: "club", id: 7 } },
        },
      ],
      allocationCount: 2,
    });

    expect(getSponsorLibraryPlacementBadge(sponsor).label).toBe("1 position · 1 assignment");
  });

  it("uses legacy primary placement when no modern allocations exist", () => {
    expect(getSponsorLibraryPlacementBadge(baseSponsor({ isPrimary: true })).label).toBe(
      "Primary placement",
    );
  });
});

describe("getSponsorLibraryStatusBadges", () => {
  it("omits placement badge for drafts", () => {
    const badges = getSponsorLibraryStatusBadges(baseSponsor({ isDraft: true, logoUrl: null }));
    expect(badges.map((badge) => badge.key)).toEqual(["draft", "no-logo"]);
  });
});
