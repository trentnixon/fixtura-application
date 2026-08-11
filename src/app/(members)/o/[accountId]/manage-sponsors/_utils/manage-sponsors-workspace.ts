import { queryKeys } from "@/lib/api/query/query-keys";

import { refreshWorkspaceSponsorDerivedFields } from "./sponsor-display";
import {
  sponsorHasPoolPlacement,
  sponsorHasPrimaryPositionSlot,
} from "./sponsorship-allocation-general";

import type { SponsorEditorSaveParams } from "../_components/editor/_types/sponsor-editor";
import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../_types/manage-sponsors";
import type {
  ManageSponsorsSponsorId,
  ManageSponsorsWorkspaceStats,
} from "../_types/manage-sponsors-workspace";
import type { PatchAccountSponsorBody } from "@/types/api/account";
import type { QueryClient } from "@tanstack/react-query";

export function isNumericServerSponsorId(id: ManageSponsorsSponsorId): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

export async function invalidateSponsors(accountId: string, queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
}

export function getFilteredWorkspaceSponsors(params: {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  searchValue: string;
  activeFilter: ManageSponsorsLibraryFilter;
}) {
  const search = params.searchValue.trim().toLowerCase();

  return params.sponsors.filter((sponsor) => {
    if (!sponsor.isActive) return false;

    const matchesSearch =
      search.length === 0 ||
      sponsor.name.toLowerCase().includes(search) ||
      sponsor.tagline?.toLowerCase().includes(search) === true;

    if (!matchesSearch) return false;

    switch (params.activeFilter) {
      case "placed":
        return sponsorHasPoolPlacement(sponsor);
      case "unassigned":
        return !sponsorHasPoolPlacement(sponsor);
      case "primary":
        return sponsor.isPrimary || sponsorHasPrimaryPositionSlot(sponsor);
      default:
        return true;
    }
  });
}

export function getWorkspaceSponsorStats(
  sponsors: ManageSponsorsWorkspaceSponsor[],
): ManageSponsorsWorkspaceStats {
  return {
    total: sponsors.length,
    placed: sponsors.filter((sponsor) => sponsorHasPoolPlacement(sponsor)).length,
    unassigned: sponsors.filter((sponsor) => !sponsorHasPoolPlacement(sponsor)).length,
    archived: sponsors.filter((sponsor) => !sponsor.isActive).length,
  };
}

export function buildServerSponsorPatchBody(
  params: SponsorEditorSaveParams,
): PatchAccountSponsorBody {
  return {
    name: params.name.trim(),
    tagline: params.tagline,
    description: params.description,
    url: params.url,
    isActive: params.isActive,
    ...(params.isActive ? {} : { isPrimary: false, order: null }),
    ...(params.clearLogo ? { logoMediaId: null as number | null } : {}),
  };
}

export function buildUpdatedLocalSponsor(params: {
  sponsor: ManageSponsorsWorkspaceSponsor;
  saveParams: SponsorEditorSaveParams;
  objectUrls: Set<string>;
}) {
  let nextLogoUrl = params.sponsor.logoUrl;
  let nextHasLogo = params.sponsor.hasLogo;

  if (params.saveParams.clearLogo) {
    if (nextLogoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(nextLogoUrl);
      params.objectUrls.delete(nextLogoUrl);
    }
    nextLogoUrl = null;
    nextHasLogo = false;
  } else if (params.saveParams.logoFile) {
    if (nextLogoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(nextLogoUrl);
      params.objectUrls.delete(nextLogoUrl);
    }
    nextLogoUrl = URL.createObjectURL(params.saveParams.logoFile);
    params.objectUrls.add(nextLogoUrl);
    nextHasLogo = true;
  }

  return refreshWorkspaceSponsorDerivedFields({
    ...params.sponsor,
    name: params.saveParams.name.trim(),
    tagline: params.saveParams.tagline,
    description: params.saveParams.description,
    url: params.saveParams.url,
    isActive: params.saveParams.isActive,
    isPrimary: params.saveParams.isActive ? params.sponsor.isPrimary : false,
    rank: params.saveParams.isActive ? params.sponsor.rank : null,
    hasLogo: nextHasLogo,
    logoUrl: nextLogoUrl,
    logoAlt: params.saveParams.name.trim() || params.sponsor.logoAlt,
    isDraft: false,
    sponsorshipAllocations: params.sponsor.sponsorshipAllocations,
  });
}
