import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "./manage-sponsors";
import type { SponsorEditorSaveParams } from "../_components/editor/_types/sponsor-editor";

export type ManageSponsorsSponsorId = number | string;

export type ManageSponsorsWorkspaceStats = {
  total: number;
  placed: number;
  unassigned: number;
  archived: number;
};

export type ManageSponsorsWorkspaceResult = {
  isRedirecting: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
  workspaceSponsors: ManageSponsorsWorkspaceSponsor[];
  stats: ManageSponsorsWorkspaceStats;
  searchValue: string;
  setSearchValue: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  setActiveFilter: (value: ManageSponsorsLibraryFilter) => void;
  saveSponsorEdits: (params: SponsorEditorSaveParams) => Promise<void>;
  restoreArchivedSponsor: (sponsorId: ManageSponsorsSponsorId) => Promise<void>;
  deleteSponsor: (sponsorId: ManageSponsorsSponsorId) => Promise<void>;
  refetch: () => Promise<unknown>;
};
