"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";

import type {
  BundlesRenderSortColumn,
  BundlesRenderSortDirection,
} from "../_utils/sort-bundles-renders";

type BundlesRenderListSortableHeadProps = {
  label: string;
  column: BundlesRenderSortColumn;
  activeColumn: BundlesRenderSortColumn;
  direction: BundlesRenderSortDirection;
  onSort: (column: BundlesRenderSortColumn) => void;
  className?: string;
  /** Season fixture tables use `primary` header band. */
  tone?: "default" | "primary";
};

/** `table.grid.sortable` — ghost header control with direction icon. */
export function BundlesRenderListSortableHead({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  className,
  tone = "default",
}: BundlesRenderListSortableHeadProps) {
  const isActive = activeColumn === column;
  const SortIcon = !isActive ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  const isPrimary = tone === "primary";

  return (
    <TableHead className={className}>
      <Button
        type="button"
        variant="ghost"
        className={
          isPrimary
            ? "-ml-2 h-8 px-2 text-xs font-bold text-white/90 uppercase hover:bg-white/10 hover:text-white"
            : "-ml-2 h-8 px-2 text-xs font-bold uppercase hover:bg-transparent"
        }
        onClick={() => onSort(column)}
      >
        {label}
        <SortIcon className="ml-2 h-3.5 w-3.5" aria-hidden />
      </Button>
    </TableHead>
  );
}
