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
  readOnly = false,
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
                  readOnly={readOnly}
                />
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
