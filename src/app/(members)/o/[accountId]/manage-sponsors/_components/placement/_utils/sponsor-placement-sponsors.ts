import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function buildEligibleSponsors(sponsors: ManageSponsorsWorkspaceSponsor[]) {
  return sponsors.filter(
    (sponsor) =>
      sponsor.isActive &&
      sponsor.hasLogo &&
      typeof sponsor.id === "number" &&
      Number.isFinite(sponsor.id) &&
      sponsor.id > 0,
  );
}

export function buildSponsorByNumericId(sponsors: ManageSponsorsWorkspaceSponsor[]) {
  const sponsorMap = new Map<number, ManageSponsorsWorkspaceSponsor>();
  for (const sponsor of sponsors) {
    if (typeof sponsor.id === "number" && sponsor.id > 0) {
      sponsorMap.set(sponsor.id, sponsor);
    }
  }
  return sponsorMap;
}
