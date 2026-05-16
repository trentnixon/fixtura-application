import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EntityAssignmentGroupRow } from "./entity-assignment-group-row";
import { EntityAssignmentTargetRow } from "./entity-assignment-target-row";
import { buildEntityAssignmentTableRows } from "../_utils/sponsor-entity-assignment-panel";

import type { SponsorEntityAssignmentTableProps } from "../_types/sponsor-entity-assignment-panel";

export function SponsorEntityAssignmentTable({
  groupedTargets,
  allocationsByTarget,
  sponsorByNumericId,
  eligibleSponsors,
  rowSelection,
  mutationState,
  setRowSelection,
  assignToTarget,
  clearTarget,
}: SponsorEntityAssignmentTableProps) {
  const rows = useMemo(
    () =>
      buildEntityAssignmentTableRows({
        groupedTargets,
        allocationsByTarget,
        sponsorByNumericId,
        rowSelection,
        isPending: mutationState.isPending,
        busyTargetKey: mutationState.busyTargetKey,
        isClearingAll: mutationState.isClearingAll,
      }),
    [
      allocationsByTarget,
      groupedTargets,
      mutationState.busyTargetKey,
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
            <TableHead>Entity</TableHead>
            <TableHead>Sponsor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                No entity targets match filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) =>
              row.kind === "group" ? (
                <EntityAssignmentGroupRow key={row.key} row={row} />
              ) : (
                <EntityAssignmentTargetRow
                  key={row.key}
                  row={row}
                  eligibleSponsors={eligibleSponsors}
                  setRowSelection={setRowSelection}
                  assignToTarget={assignToTarget}
                  clearTarget={clearTarget}
                />
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
