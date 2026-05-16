import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function getArchivedSponsorLogoAlt(sponsor: ManageSponsorsWorkspaceSponsor) {
  return sponsor.logoAlt ?? sponsor.name;
}
