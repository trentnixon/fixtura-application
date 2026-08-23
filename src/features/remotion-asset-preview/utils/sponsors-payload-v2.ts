/** Slim sponsor DTO on asset JSON (Scheduler → Remotion sponsors payload v2). */
export type RemotionClubSponsorRow = {
  id: number;
  name: string;
  logo: { id: number; url: string };
};

export type ClubSponsorsPayload = {
  primary: RemotionClubSponsorRow[];
  general: RemotionClubSponsorRow[];
  sponsorNum: number;
};

export type RowAssignSponsors = {
  competition: RemotionClubSponsorRow[];
  grade: RemotionClubSponsorRow[];
  team: RemotionClubSponsorRow[];
};

/** Empty entity buckets on demo content rows (no entity links in preview). */
export const EMPTY_ROW_ASSIGN_SPONSORS: RowAssignSponsors = {
  competition: [],
  grade: [],
  team: [],
};

/** Empty account-level sponsors shell for static cricket example JSON. */
export const EMPTY_CLUB_SPONSORS: ClubSponsorsPayload = {
  primary: [],
  general: [],
  sponsorNum: 0,
};

/** @deprecated Prefer {@link EMPTY_ROW_ASSIGN_SPONSORS}. */
export const EMPTY_ASSIGN_SPONSORS = EMPTY_ROW_ASSIGN_SPONSORS;

export type DemoContentRowSponsorFields = {
  assignSponsors: {
    competition: [];
    grade: [];
    team: [];
  };
  primaryForScreen: [];
};

/** Shared empty per-row sponsor fields for cricket demo generators. */
export function emptyDemoContentRowSponsorFields(): DemoContentRowSponsorFields {
  return {
    assignSponsors: {
      competition: [],
      grade: [],
      team: [],
    },
    primaryForScreen: [],
  };
}
