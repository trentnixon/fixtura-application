import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SponsorSelectOptionLabel } from "../../shared/sponsor-select-option-label";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { Dispatch, SetStateAction } from "react";

export function SponsorPlacementSponsorSelect({
  selectionKey,
  selectValue,
  sponsors,
  disabled,
  setRowSelection,
}: {
  selectionKey: string;
  selectValue: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
  disabled: boolean;
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  return (
    <Select
      value={selectValue}
      onValueChange={(value) => setRowSelection((prev) => ({ ...prev, [selectionKey]: value }))}
      disabled={disabled}
    >
      <SelectTrigger className="h-auto min-h-9 w-full max-w-md py-1.5">
        <SelectValue placeholder="Select sponsor" />
      </SelectTrigger>
      <SelectContent>
        {sponsors.map((sponsor) => (
          <SelectItem key={sponsor.id} value={String(sponsor.id)} textValue={sponsor.name}>
            <SponsorSelectOptionLabel
              name={sponsor.name}
              logoUrl={sponsor.logoUrl}
              logoAlt={sponsor.logoAlt}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
