import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { EntityTargetAllocation } from "../../../_utils/sponsorship-allocation-entity";
import type { AccountSponsorEntityTarget } from "@/types/api/account";

export type SponsorEntityAssetPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  templateModeSlug?: string | null;
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  primarySponsors: ManageSponsorsWorkspaceSponsor[];
  previewTargets: AccountSponsorEntityTarget[];
  className?: string;
};

export type EntityPreviewCard = {
  target: AccountSponsorEntityTarget;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
};
