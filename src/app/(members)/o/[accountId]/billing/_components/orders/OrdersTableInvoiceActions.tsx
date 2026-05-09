import { Button } from "@/components/ui/button";

import { ordersTableSectionCopy } from "../../_constants/ordersTableSection";

import type { OrdersTableInvoiceActionsProps } from "../../_types/ordersTableSection";

export function OrdersTableInvoiceActions({
  hostedInvoiceUrl,
  invoicePdfUrl,
}: OrdersTableInvoiceActionsProps) {
  if (!hostedInvoiceUrl && !invoicePdfUrl) {
    return <span className="text-muted-foreground">{ordersTableSectionCopy.missingName}</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {hostedInvoiceUrl ? (
        <Button variant="outline" size="sm" className="h-8" asChild>
          <a href={hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
            {ordersTableSectionCopy.viewHostedInvoice}
          </a>
        </Button>
      ) : null}
      {invoicePdfUrl ? (
        <Button variant="brand" size="sm" className="h-8" asChild>
          <a href={invoicePdfUrl} target="_blank" rel="noopener noreferrer">
            {ordersTableSectionCopy.downloadInvoicePdf}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
