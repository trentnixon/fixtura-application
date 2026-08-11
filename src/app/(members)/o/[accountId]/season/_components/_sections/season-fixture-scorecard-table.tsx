"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SeasonFixtureScorecardTableProps = {
  title: string;
  headers: string[];
  rows: string[][];
};

const SCORECARD_CELL_BASE =
  "!px-3 !py-2 h-auto text-left align-middle text-foreground whitespace-nowrap tabular-nums normal-case tracking-normal";

const SCORECARD_HEAD_CLASS = `${SCORECARD_CELL_BASE} text-sm font-bold`;

const SCORECARD_BODY_CLASS = `${SCORECARD_CELL_BASE} text-xs font-normal`;

export function SeasonFixtureScorecardTable({
  title,
  headers,
  rows,
}: SeasonFixtureScorecardTableProps) {
  if (rows.length === 0) {
    return null;
  }

  const columnCount =
    headers.length > 0 ? headers.length : Math.max(...rows.map((row) => row.length), 1);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-full text-xs">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {headers.length > 0
                ? headers.map((header, index) => (
                    <TableHead key={`${header}-${index}`} className={SCORECARD_HEAD_CLASS}>
                      {header}
                    </TableHead>
                  ))
                : Array.from({ length: columnCount }, (_, index) => (
                    <TableHead key={`col-${index}`} className={SCORECARD_HEAD_CLASS}>
                      Col {index + 1}
                    </TableHead>
                  ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {Array.from({ length: columnCount }, (_, cellIndex) => (
                  <TableCell key={`cell-${rowIndex}-${cellIndex}`} className={SCORECARD_BODY_CLASS}>
                    {row[cellIndex]?.trim() ? row[cellIndex] : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
