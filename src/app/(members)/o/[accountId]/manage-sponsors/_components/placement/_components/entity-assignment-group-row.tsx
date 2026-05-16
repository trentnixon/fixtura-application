import { Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";

import type { EntityAssignmentGroupRowProps } from "../_types/sponsor-entity-assignment-panel";

export function EntityAssignmentGroupRow({ row }: EntityAssignmentGroupRowProps) {
  return (
    <TableRow className="bg-muted/35 hover:bg-muted/35">
      <TableCell colSpan={3} className="h-10 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Layers className="text-muted-foreground size-4" aria-hidden />
          <span>{row.label}</span>
          <Badge variant="outline" className="ml-1">
            {row.targetCount}
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  );
}
