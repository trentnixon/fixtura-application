import { countPositionSlotAllocationsForSponsor } from "./sponsorship-allocation-general";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";
import type { AccountSponsorDto } from "@/types/api/account";

export function formatSponsorDateLabel(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function getAccountSponsorPlacementLabel(sponsor: AccountSponsorDto): string {
  if (sponsor.isPrimary) return "Primary";
  if (sponsor.order != null) return `Rank ${sponsor.order}`;
  return "Unassigned";
}

function getAccountSponsorUsageLabel(sponsor: AccountSponsorDto): string {
  if (sponsor.isPrimary) return "Global placement";
  if (sponsor.order != null) return "Ranked end screen";
  if (sponsor.sponsorshipAllocations.length > 0) return "Placements assigned";
  return "Pool only";
}

export function getWorkspaceSponsorPlacementLabel(sponsor: ManageSponsorsWorkspaceSponsor): string {
  const posCount = countPositionSlotAllocationsForSponsor(sponsor);
  if (posCount > 0) {
    return posCount === 1 ? "1 assigned slot" : `${posCount} assigned slots`;
  }
  if (sponsor.isPrimary) return "Primary (legacy)";
  return "Unassigned";
}

export function getWorkspaceSponsorUsageLabel(sponsor: ManageSponsorsWorkspaceSponsor): string {
  if (sponsor.isDraft) return "Draft sponsor";
  const posCount = countPositionSlotAllocationsForSponsor(sponsor);
  if (posCount > 0) {
    return "";
  }
  if (sponsor.isPrimary) return "Global placement (legacy)";
  if (sponsor.allocationCount > 0) return "Placements assigned";
  return "Pool only";
}

export function refreshWorkspaceSponsorDerivedFields(
  sponsor: ManageSponsorsWorkspaceSponsor,
): ManageSponsorsWorkspaceSponsor {
  return {
    ...sponsor,
    placementLabel: getWorkspaceSponsorPlacementLabel(sponsor),
    usageLabel: getWorkspaceSponsorUsageLabel(sponsor),
  };
}

export function mapAccountSponsorToWorkspaceSponsor(
  sponsor: AccountSponsorDto,
): ManageSponsorsWorkspaceSponsor {
  return refreshWorkspaceSponsorDerivedFields({
    id: sponsor.id,
    name: sponsor.name,
    tagline: sponsor.tagline,
    description: sponsor.description,
    url: sponsor.url,
    startDate: sponsor.startDate,
    endDate: sponsor.endDate,
    isActive: sponsor.isActive,
    isPrimary: sponsor.isPrimary,
    rank: sponsor.order,
    hasLogo: Boolean(sponsor.logo?.url),
    logoUrl: sponsor.logo?.url ?? null,
    logoAlt: sponsor.logo?.alternativeText ?? sponsor.name,
    sponsorshipAllocations: sponsor.sponsorshipAllocations,
    allocationCount: sponsor.sponsorshipAllocations.length,
    placementLabel: getAccountSponsorPlacementLabel(sponsor),
    usageLabel: getAccountSponsorUsageLabel(sponsor),
    isDraft: false,
  });
}
