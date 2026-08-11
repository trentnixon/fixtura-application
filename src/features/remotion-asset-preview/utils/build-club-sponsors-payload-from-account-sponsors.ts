import {
  ALL_GENERAL_POSITION_SLOTS,
  ALL_POSITION_SLOT_IDS,
  POSITION_ALLOCATION_CATEGORY,
  PRIMARY_POSITION_SLOTS,
} from "@/app/(members)/o/[accountId]/manage-sponsors/_constants/sponsor-position-slots";
import { parseGeneralAccountGroup } from "@/app/(members)/o/[accountId]/manage-sponsors/_utils/sponsorship-allocation-general";

import type { AccountSponsorDto } from "@/types/api/account";

/** One sponsor row under `videoMeta.club.sponsors` (cricket-style example datasets). */
export type RemotionClubSponsorRow = {
  id: number;
  url: string | null;
  logo: { id: number; url: string };
  name: string;
  isVideo: boolean;
  tagline: string | null;
  isActive: boolean;
  isArticle: boolean;
  isPrimary: boolean;
  description: string | null;
};

export type ClubSponsorsPayload = {
  default: Record<string, RemotionClubSponsorRow[]>;
  primary: RemotionClubSponsorRow[];
};

function sortActiveSponsors(sponsors: AccountSponsorDto[]): AccountSponsorDto[] {
  return sponsors
    .filter((s) => s.isActive)
    .slice()
    .sort((a, b) => {
      const oa = a.order ?? 9999;
      const ob = b.order ?? 9999;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
}

export function accountSponsorDtoToRemotionClubSponsorRow(
  s: AccountSponsorDto,
): RemotionClubSponsorRow {
  const logo = s.logo;
  return {
    id: s.id,
    url: s.url,
    logo:
      logo != null && logo.url != null && String(logo.url).trim() !== ""
        ? { id: logo.id, url: String(logo.url) }
        : { id: 0, url: "" },
    name: s.name,
    isVideo: s.isVideo,
    tagline: s.tagline,
    isActive: s.isActive,
    isArticle: s.isArticle,
    isPrimary: s.isPrimary,
    description: s.description,
  };
}

/**
 * Builds `videoMeta.club.sponsors` for Remotion preview datasets from GET /accounts/:id/sponsors.
 * Active sponsors only. Position rows (`global` allocations) win; remaining sponsors fill empty slots
 * in `order` / name order (primary tier first when unassigned).
 * Never retains JSON from the example file — only this payload is written at merge time.
 */
export function buildClubSponsorsPayloadFromAccountSponsors(
  sponsors: AccountSponsorDto[] | null | undefined,
): ClubSponsorsPayload {
  const active = sortActiveSponsors(sponsors ?? []);
  const slotToSponsor = new Map<string, AccountSponsorDto>();

  for (const sponsor of active) {
    for (const row of sponsor.sponsorshipAllocations) {
      const ag = parseGeneralAccountGroup(row.allocation);
      if (!ag || ag.category !== POSITION_ALLOCATION_CATEGORY) continue;
      if (!ALL_POSITION_SLOT_IDS.has(ag.id)) continue;
      if (!slotToSponsor.has(ag.id)) slotToSponsor.set(ag.id, sponsor);
    }
  }

  const assignedIds = new Set<number>(Array.from(slotToSponsor.values(), (s) => s.id));
  const unassigned = active.filter((s) => !assignedIds.has(s.id));
  const primaryQueue = unassigned.filter((s) => s.isPrimary);
  const generalQueue = unassigned.filter((s) => !s.isPrimary);

  for (const slot of PRIMARY_POSITION_SLOTS) {
    if (slotToSponsor.has(slot.id)) continue;
    const next = primaryQueue.shift();
    if (next) slotToSponsor.set(slot.id, next);
  }

  for (const slot of ALL_GENERAL_POSITION_SLOTS) {
    if (slotToSponsor.has(slot.id)) continue;
    const next = generalQueue.shift();
    if (next) slotToSponsor.set(slot.id, next);
  }

  for (const slot of ALL_GENERAL_POSITION_SLOTS) {
    if (slotToSponsor.has(slot.id)) continue;
    const next = primaryQueue.shift();
    if (next) slotToSponsor.set(slot.id, next);
  }

  const defaultSlots: Record<string, RemotionClubSponsorRow[]> = {};
  for (const [slotId, sponsor] of slotToSponsor) {
    defaultSlots[slotId] = [accountSponsorDtoToRemotionClubSponsorRow(sponsor)];
  }

  const primaryRows: RemotionClubSponsorRow[] = [];
  for (const slot of PRIMARY_POSITION_SLOTS) {
    const sponsor = slotToSponsor.get(slot.id);
    if (sponsor) primaryRows.push(accountSponsorDtoToRemotionClubSponsorRow(sponsor));
  }

  return { default: defaultSlots, primary: primaryRows };
}
