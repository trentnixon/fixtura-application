import type { SponsorPositionSlotDef } from "../../../_constants/sponsor-position-slots";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { SlotOccupant } from "../../../_utils/sponsorship-allocation-general";

export type SponsorPositionAssetPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  templateModeSlug?: string | null;
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  previewSlots: SponsorPositionSlotDef[];
  className?: string;
};

export type SponsorPositionPreviewCell = SponsorPositionSlotDef | null;
