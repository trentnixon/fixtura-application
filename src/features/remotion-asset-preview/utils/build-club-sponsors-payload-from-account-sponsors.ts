import {
  ALL_GENERAL_POSITION_SLOTS,
  ALL_POSITION_SLOT_IDS,
  POSITION_ALLOCATION_CATEGORY,
  PRIMARY_POSITION_SLOTS,
} from "@/app/(members)/o/[accountId]/manage-sponsors/_constants/sponsor-position-slots";
import { parseGeneralAccountGroup } from "@/app/(members)/o/[accountId]/manage-sponsors/_utils/sponsorship-allocation-general";

import type { AccountSponsorDto } from "@/types/api/account";

import type { ClubSponsorsPayload, RemotionClubSponsorRow } from "./sponsors-payload-v2";

export type { ClubSponsorsPayload, RemotionClubSponsorRow } from "./sponsors-payload-v2";
export { EMPTY_ASSIGN_SPONSORS, EMPTY_CLUB_SPONSORS, EMPTY_ROW_ASSIGN_SPONSORS } from "./sponsors-payload-v2";

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
    name: s.name,
    logo:
      logo != null && logo.url != null && String(logo.url).trim() !== ""
        ? { id: logo.id, url: String(logo.url) }
        : { id: 0, url: "" },
  };
}

/**
 * Builds `videoMeta.club.sponsors` for Remotion preview datasets from GET /accounts/:id/sponsors.
 * Active sponsors only. Position rows (`global` allocations) win; remaining sponsors fill empty slots
 * in `order` / name order (primary tier first when unassigned).
 * Emits v2 arrays (`primary`, `general`, `sponsorNum`) — never retains example JSON.
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

  const primary: RemotionClubSponsorRow[] = [];
  for (const slot of PRIMARY_POSITION_SLOTS) {
    const sponsor = slotToSponsor.get(slot.id);
    if (sponsor) primary.push(accountSponsorDtoToRemotionClubSponsorRow(sponsor));
  }

  const general: RemotionClubSponsorRow[] = [];
  for (const slot of ALL_GENERAL_POSITION_SLOTS) {
    const sponsor = slotToSponsor.get(slot.id);
    if (sponsor) general.push(accountSponsorDtoToRemotionClubSponsorRow(sponsor));
  }

  return {
    primary,
    general,
    sponsorNum: primary.length + general.length,
  };
}
