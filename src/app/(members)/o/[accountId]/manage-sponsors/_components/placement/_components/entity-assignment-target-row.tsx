import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

import { EntityAssignmentPreview } from "./entity-assignment-preview";
import { SponsorPlacementSponsorSelect } from "./sponsor-placement-sponsor-select";

import type { EntityAssignmentTargetRowProps } from "../_types/sponsor-entity-assignment-panel";

export function EntityAssignmentTargetRow({
  row,
  eligibleSponsors,
  setRowSelection,
  assignToTarget,
  clearTarget,
}: EntityAssignmentTargetRowProps) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className="flex max-w-md min-w-0 items-center gap-3">
          <EntityAssignmentPreview sponsor={row.previewSponsor} />
          <div className="grid min-w-0 gap-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="min-w-0 font-medium">{row.label}</span>
              <Badge variant="secondary">{row.target.type}</Badge>
            </div>
            {row.context ? <p className="text-muted-foreground text-xs">{row.context}</p> : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-56 whitespace-normal">
        <div className="grid gap-2">
          {row.hasAssignment && row.firstAssignment ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium">
                {row.previewSponsor?.name ?? row.firstAssignment.sponsorName}
              </span>
              {row.assignments.length > 1 ? (
                <Badge variant="destructive">+{row.assignments.length - 1}</Badge>
              ) : null}
            </div>
          ) : (
            <SponsorPlacementSponsorSelect
              selectionKey={row.key}
              selectValue={row.selectValue}
              sponsors={eligibleSponsors}
              disabled={row.rowBusy}
              setRowSelection={setRowSelection}
            />
          )}
        </div>
      </TableCell>
      <TableCell className="text-right whitespace-normal">
        <div className="flex justify-end gap-2">
          {!row.hasAssignment ? (
            <Button
              type="button"
              variant="brand"
              size="sm"
              className="h-8"
              disabled={row.rowBusy || !row.selectValue}
              onClick={() => void assignToTarget(row.target)}
            >
              Assign
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="compact"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none hover:translate-y-0 hover:border-transparent"
            disabled={row.rowBusy || !row.hasAssignment}
            onClick={() => void clearTarget(row.target)}
          >
            Clear
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
