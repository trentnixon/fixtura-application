import { describe, expect, it } from "vitest";

import { buildClubSponsorsPayloadFromAccountSponsors } from "./build-club-sponsors-payload-from-account-sponsors";
import { EMPTY_CLUB_SPONSORS } from "./sponsors-payload-v2";

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
  it("returns empty primary, general, and sponsorNum 0 when sponsors are null", () => {
    const payload = buildClubSponsorsPayloadFromAccountSponsors(null);
    expect(payload).toEqual(EMPTY_CLUB_SPONSORS);
  });

  it("ignores inactive sponsors", () => {
    const payload = buildClubSponsorsPayloadFromAccountSponsors([
      sponsorFixture({ id: 10, name: "Off", isActive: false, isPrimary: true }),
    ]);
    expect(payload).toEqual(EMPTY_CLUB_SPONSORS);
  });

  it("places isPrimary unassigned sponsors in primary then general in general", () => {
    const payload = buildClubSponsorsPayloadFromAccountSponsors([
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
    expect(payload.primary.map((r) => r.id)).toEqual([1]);
    expect(payload.general.map((r) => r.id)).toEqual([2]);
    expect(payload.sponsorNum).toBe(2);
    expect(payload.primary[0]).toEqual({
      id: 1,
      name: "Primary Co",
      logo: { id: 0, url: "" },
    });
    expect(payload.general[0]).toEqual({
      id: 2,
      name: "General Co",
      logo: { id: 9, url: "https://x/g.png" },
    });
  });

  it("honours global position allocation slot id when present", () => {
    const payload = buildClubSponsorsPayloadFromAccountSponsors([
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
    expect(payload.primary).toEqual([]);
    expect(payload.general.map((r) => r.id)).toEqual([50]);
    expect(payload.general[0]?.name).toBe("In slot 3");
    expect(payload.sponsorNum).toBe(1);
  });

  it("overflows unassigned primary sponsors into general slots after primary tier is full", () => {
    const payload = buildClubSponsorsPayloadFromAccountSponsors(
      [1, 2, 3, 4, 5].map((id) =>
        sponsorFixture({ id, name: `Primary ${id}`, isPrimary: true, order: id }),
      ),
    );
    expect(payload.primary.map((row) => row.id)).toEqual([1, 2, 3, 4]);
    expect(payload.general.map((row) => row.id)).toEqual([5]);
    expect(payload.sponsorNum).toBe(5);
  });
});
