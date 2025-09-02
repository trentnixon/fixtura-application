import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ReactNode } from "react";

export type BasicTableColumn = {
  key: string;
  header: ReactNode;
  className?: string;
};

export type BasicTableProps = {
  columns: BasicTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  className?: string;
  "data-testid"?: string;
};

export function BasicTable({ columns, rows, className, ...props }: BasicTableProps) {
  return (
    <div className={className} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
