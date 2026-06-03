import { describe, expect, it } from "vitest";

import { buildClubSponsorsPayloadFromAccountSponsors } from "./build-club-sponsors-payload-from-account-sponsors";

import type { AccountSponsorDto } from "@/types/api/account";

function sponsorFixture(overrides: Partial<AccountSponsorDto> = {}): AccountSponsorDto {
  return {
    id: 1,
    name: "S",
    url: null,
    startDate: null,
    endDate: null,
    isActive: true,
    isPrimary: false,
    tagline: null,
    order: 0,
    description: null,
    isVideo: false,
    isArticle: false,
    logo: null,
    sponsorshipAllocations: [],
    ...overrides,
  };
}

describe("buildClubSponsorsPayloadFromAccountSponsors", () => {
  it("returns empty default and primary when sponsors are null", () => {
    const { default: d, primary } = buildClubSponsorsPayloadFromAccountSponsors(null);
    expect(primary).toEqual([]);
    expect(Object.keys(d)).toEqual([]);
  });

  it("ignores inactive sponsors", () => {
    const { default: d, primary } = buildClubSponsorsPayloadFromAccountSponsors([
      sponsorFixture({ id: 10, name: "Off", isActive: false, isPrimary: true }),
    ]);
    expect(primary).toEqual([]);
    expect(Object.keys(d)).toEqual([]);
  });

  it("places isPrimary unassigned sponsors in primary tier then general in general slots", () => {
    const { default: d, primary } = buildClubSponsorsPayloadFromAccountSponsors([
      sponsorFixture({
        id: 2,
        name: "General Co",
        isPrimary: false,
        order: 2,
        logo: {
          id: 9,
          url: "https://x/g.png",
          width: 1,
          height: 1,
          mime: null,
          alternativeText: null,
        },
      }),
      sponsorFixture({ id: 1, name: "Primary Co", isPrimary: true, order: 1 }),
    ]);
    expect(d["primary_sponsor"]?.[0]?.id).toBe(1);
    expect(d["general_sponsor_1"]?.[0]?.id).toBe(2);
    expect(primary.map((r) => r.id)).toEqual([1]);
  });

  it("honours global position allocation slot id when present", () => {
    const { default: d, primary } = buildClubSponsorsPayloadFromAccountSponsors([
      sponsorFixture({
        id: 50,
        name: "In slot 3",
        isPrimary: false,
        sponsorshipAllocations: [
          {
            id: 1,
            allocation: {
              accountGroup: {
                category: "global",
                id: "general_sponsor_3",
                level: "",
                name: "",
              },
            },
          },
        ],
      }),
    ]);
    expect(d["general_sponsor_3"]?.[0]?.name).toBe("In slot 3");
    expect(d["general_sponsor_1"]).toBeUndefined();
    expect(primary).toEqual([]);
  });
});
