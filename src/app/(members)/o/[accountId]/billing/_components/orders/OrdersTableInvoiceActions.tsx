import { Download, ExternalLink } from "lucide-react";

import { TypographyDataLabel } from "@/components/typography";
import { Button } from "@/components/ui/button";

import { ordersTableSectionCopy } from "../../_constants/orders/ordersTableSection";

import type { OrdersTableInvoiceActionsProps } from "../../_types/orders/ordersTableSection";

export function OrdersTableInvoiceActions({
  hostedInvoiceUrl,
  invoicePdfUrl,
}: OrdersTableInvoiceActionsProps) {
  if (!hostedInvoiceUrl && !invoicePdfUrl) {
    return (
      <TypographyDataLabel as="span">{ordersTableSectionCopy.missingName}</TypographyDataLabel>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {invoicePdfUrl ? (
        <Button variant="brand" size="sm" className="h-8" asChild>
          <a href={invoicePdfUrl} target="_blank" rel="noopener noreferrer">
            <Download className="size-3.5" aria-hidden />
            {ordersTableSectionCopy.downloadInvoicePdf}
          </a>
        </Button>
      ) : null}
      {hostedInvoiceUrl ? (
        <Button variant={invoicePdfUrl ? "outline" : "brand"} size="sm" className="h-8" asChild>
          <a href={hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" aria-hidden />
            {invoicePdfUrl
              ? ordersTableSectionCopy.viewHostedInvoice
              : ordersTableSectionCopy.downloadInvoicePdf}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
