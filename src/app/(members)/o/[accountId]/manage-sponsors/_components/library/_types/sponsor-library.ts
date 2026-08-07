import type {
  ManageSponsorsLibraryFilter,
  ManageSponsorsWorkspaceSponsor,
} from "../../../_types/manage-sponsors";

export type SponsorPoolStats = {
  total: number;
  placed: number;
  unassigned: number;
  archived: number;
};

export type SponsorLibraryPanelProps = {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
  stats: SponsorPoolStats;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** When set, the pool card exposes Edit to manage sponsor fields remotely. */
  onEditSponsor?: ((sponsorId: number | string) => void) | undefined;
};

export type SponsorLibraryToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
  disabled?: boolean;
};

export type SponsorLibraryFilterToggleProps = Pick<
  SponsorLibraryToolbarProps,
  "activeFilter" | "onFilterChange" | "disabled"
>;

export type SponsorLibraryCardProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  disabled?: boolean;
  readOnly?: boolean;
  onEditSponsor?: ((sponsorId: number | string) => void) | undefined;
};

export type SponsorLibrarySearchProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};
