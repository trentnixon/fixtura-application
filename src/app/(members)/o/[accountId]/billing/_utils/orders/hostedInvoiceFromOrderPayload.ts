/** Normalise hosted invoice / PDF URIs returned on order rows or billing summary orders. */
export function extractHostedInvoiceFromOrderPayload(order: Record<string, unknown>): {
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
} {
  const hostedRaw = order["hosted_invoice_url"] ?? order["hostedInvoiceUrl"];
  const pdfRaw = order["invoice_pdf"] ?? order["invoicePdf"] ?? order["invoicePdfUrl"];

  const hosted =
    typeof hostedRaw === "string" && hostedRaw.trim().length > 0 ? hostedRaw.trim() : null;
  const pdf = typeof pdfRaw === "string" && pdfRaw.trim().length > 0 ? pdfRaw.trim() : null;

  return { hostedInvoiceUrl: hosted, invoicePdfUrl: pdf };
}
