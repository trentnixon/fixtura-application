import { Download, ExternalLink } from "lucide-react";

import { TypographyDataLabel } from "@/components/typography";
import { Button } from "@/components/ui/button";

import { ordersTableSectionCopy } from "../../_constants/orders/ordersTableSection";

import type { OrdersTableInvoiceActionsProps } from "../../_types/orders/ordersTableSection";

export function OrdersTableInvoiceActions({
  hostedInvoiceUrl,
  invoicePdfUrl,
  showPayAction = false,
}: OrdersTableInvoiceActionsProps) {
  if (!hostedInvoiceUrl && !invoicePdfUrl) {
    return (
      <TypographyDataLabel as="span">{ordersTableSectionCopy.missingName}</TypographyDataLabel>
    );
  }

  const hostedLabel = showPayAction
    ? ordersTableSectionCopy.payInvoice
    : ordersTableSectionCopy.viewHostedInvoice;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {hostedInvoiceUrl ? (
        <Button
          variant={invoicePdfUrl && !showPayAction ? "outline" : "brand"}
          size="sm"
          className="h-8"
          asChild
        >
          <a
            href={hostedInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${hostedLabel} (opens in a new tab)`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            {hostedLabel}
          </a>
        </Button>
      ) : null}
      {invoicePdfUrl ? (
        <Button variant={hostedInvoiceUrl ? "outline" : "brand"} size="sm" className="h-8" asChild>
          <a
            href={invoicePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ordersTableSectionCopy.downloadInvoicePdf} (opens in a new tab)`}
          >
            <Download className="size-3.5" aria-hidden />
            {ordersTableSectionCopy.downloadInvoicePdf}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
