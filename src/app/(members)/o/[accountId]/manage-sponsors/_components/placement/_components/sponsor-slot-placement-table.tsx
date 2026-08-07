import { Info } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { SlotAssignmentPreview } from "./slot-assignment-preview";
import { SponsorPlacementSponsorSelect } from "./sponsor-placement-sponsor-select";
import { getSponsorPositionSlotDescription } from "../../../_constants/sponsor-position-slots";
import { buildSponsorSlotPlacementTableRows } from "../_utils/sponsor-slot-placement-panel";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type {
  SponsorSlotPlacementTableProps,
  SponsorSlotPlacementTableRow,
} from "../_types/sponsor-slot-placement-panel";
import type { Dispatch, SetStateAction } from "react";

export function SponsorSlotPlacementTable({
  displaySlots,
  occupants,
  sponsorByNumericId,
  eligibleForPicker,
  rowSelection,
  mutationState,
  setRowSelection,
  assignToSlot,
  clearSlot,
  readOnly = false,
}: SponsorSlotPlacementTableProps) {
  const rows = useMemo(
    () =>
      buildSponsorSlotPlacementTableRows({
        displaySlots,
        occupants,
        sponsorByNumericId,
        rowSelection,
        isPending: mutationState.isPending,
        busySlotId: mutationState.busySlotId,
        isClearingAll: mutationState.isClearingAll,
      }),
    [
      displaySlots,
      occupants,
      mutationState.busySlotId,
      mutationState.isClearingAll,
      mutationState.isPending,
      rowSelection,
      sponsorByNumericId,
    ],
  );

  return (
    <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted/55">
            <TableHead>Position</TableHead>
            <TableHead>Sponsor</TableHead>
            {!readOnly ? <TableHead className="text-right">Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={readOnly ? 2 : 3}
                className="text-muted-foreground h-24 text-center"
              >
                No positions match filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <SponsorSlotPlacementRow
                key={row.key}
                row={row}
                eligibleForPicker={eligibleForPicker}
                setRowSelection={setRowSelection}
                assignToSlot={assignToSlot}
                clearSlot={clearSlot}
                readOnly={readOnly}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SponsorSlotPlacementRow({
  row,
  eligibleForPicker,
  setRowSelection,
  assignToSlot,
  clearSlot,
  readOnly = false,
}: {
  row: SponsorSlotPlacementTableRow;
  eligibleForPicker: ManageSponsorsWorkspaceSponsor[];
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  assignToSlot: SponsorSlotPlacementTableProps["assignToSlot"];
  clearSlot: SponsorSlotPlacementTableProps["clearSlot"];
  readOnly?: boolean;
}) {
  return (
    <TableRow
      className={cn(
        row.isPrimary && "bg-brand/10 hover:bg-brand/15 dark:bg-brand/15 dark:hover:bg-brand/20",
      )}
    >
      <TableCell className="whitespace-normal">
        <div className="flex max-w-xs min-w-0 items-center gap-3">
          <SlotAssignmentPreview sponsor={row.assigned} />
          <span className="flex min-w-0 items-center gap-1.5 font-medium">
            <span className="min-w-0 truncate">{row.slot.title}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-7 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                  aria-label={`About ${row.slot.title}`}
                >
                  <Info className="size-3.5" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {getSponsorPositionSlotDescription(row.slot.id)}
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
      </TableCell>
      <TableCell className="min-w-48 whitespace-normal">
        {row.occupant ? (
          <span className="font-medium">
            {row.assigned?.name ?? `Sponsor #${row.occupant.sponsorId}`}
          </span>
        ) : readOnly ? (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        ) : (
          <SponsorPlacementSponsorSelect
            selectionKey={row.slot.id}
            selectValue={row.selectValue}
            sponsors={eligibleForPicker}
            disabled={row.rowBusy}
            setRowSelection={setRowSelection}
          />
        )}
      </TableCell>
      {!readOnly ? (
        <TableCell className="text-right whitespace-normal">
          <div className="flex justify-end gap-2">
            {!row.occupant ? (
              <Button
                type="button"
                variant="brand"
                size="sm"
                className="h-8"
                disabled={row.rowBusy || !row.selectValue}
                onClick={() => void assignToSlot(row.slot)}
              >
                Assign
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="compact"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none hover:translate-y-0 hover:border-transparent"
              disabled={row.rowBusy || !row.occupant}
              onClick={() => void clearSlot(row.slot.id)}
            >
              Clear
            </Button>
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
