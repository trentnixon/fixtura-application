"use client";

import { useMemo, useState } from "react";

import { AdvancedTable } from "@/components/tables/AdvancedTable";
import { BasicTable, type BasicTableColumn } from "@/components/tables/BasicTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

type Invoice = {
  invoice: string;
  status: string;
  method: string;
  amount: string;
};

export function TablesPanel() {
  // Basic table demo with simple client-side pagination
  const basicColumns: BasicTableColumn[] = [
    { key: "invoice", header: "Invoice", className: "w-[120px]" },
    { key: "status", header: "Status" },
    { key: "method", header: "Method" },
    { key: "amount", header: "Amount text-right", className: "text-right" },
  ];

  const basicRows: Array<Record<string, ReactNode>> = Array.from({ length: 12 }).map((_, i) => ({
    invoice: `INV${String(i + 1).padStart(3, "0")}`,
    status: i % 3 === 0 ? "Paid" : i % 3 === 1 ? "Processing" : "Unpaid",
    method: i % 2 === 0 ? "Credit Card" : "Bank Transfer",
    amount: `$${(200 + i * 10).toFixed(2)}`,
  }));

  const [page, setPage] = useState(0);
  const pageSize = 5;
  const pageCount = Math.ceil(basicRows.length / pageSize);
  const pagedRows = useMemo(
    () => basicRows.slice(page * pageSize, page * pageSize + pageSize),
    [basicRows, page],
  );

  // Advanced table demo (sortable via TanStack)
  const advancedColumns: ColumnDef<Invoice, unknown>[] = [
    { accessorKey: "invoice", header: "Invoice", cell: (info) => info.getValue() as string },
    { accessorKey: "status", header: "Status", cell: (info) => info.getValue() as string },
    { accessorKey: "method", header: "Method", cell: (info) => info.getValue() as string },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: (info) => <div className="text-right">{info.getValue() as string}</div>,
    },
  ];

  const advancedData: Invoice[] = basicRows.map((r) => ({
    invoice: String(r["invoice"]),
    status: String(r["status"]),
    method: String(r["method"]),
    amount: String(r["amount"]),
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Table (with pagination)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BasicTable columns={basicColumns} rows={pagedRows} />
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Page {page + 1} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Table (sorting)</CardTitle>
        </CardHeader>
        <CardContent>
          <AdvancedTable columns={advancedColumns} data={advancedData} />
        </CardContent>
      </Card>
    </div>
  );
}
