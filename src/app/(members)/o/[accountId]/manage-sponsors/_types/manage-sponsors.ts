import type { AccountSponsorshipAllocation } from "@/types/api/account";

export type ManageSponsorsWorkspaceSponsor = {
  id: number | string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isPrimary: boolean;
  rank: number | null;
  hasLogo: boolean;
  logoUrl: string | null;
  logoAlt: string | null;
  sponsorshipAllocations: AccountSponsorshipAllocation[];
  allocationCount: number;
  placementLabel: string;
  usageLabel: string;
  isDraft: boolean;
};

export type ManageSponsorsLibraryFilter = "all" | "placed" | "unassigned" | "primary";
