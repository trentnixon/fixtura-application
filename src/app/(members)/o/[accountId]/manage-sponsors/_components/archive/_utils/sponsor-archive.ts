import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function getArchivedSponsors(
  sponsors: ManageSponsorsWorkspaceSponsor[],
): ManageSponsorsWorkspaceSponsor[] {
  return sponsors
    .filter((sponsor) => !sponsor.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getSponsorMutationErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Sponsor update failed. Please try again.";
}
