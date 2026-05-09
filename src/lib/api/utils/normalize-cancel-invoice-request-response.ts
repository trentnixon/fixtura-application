/**
 * POST …/billing/invoice-requests/:id/cancel — camelCase v1 and optional `{ data }` wrapper.
 */

import type { CancelInvoiceRequestResponse } from "@/types/api/account";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickString(
  obj: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
): string | undefined {
  for (const key of [camelKey, snakeKey]) {
    const v = obj[key];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function pickBoolean(obj: Record<string, unknown>, camelKey: string, snakeKey: string): boolean {
  for (const key of [camelKey, snakeKey]) {
    const v = obj[key];
    if (typeof v === "boolean") return v;
  }
  return false;
}

function unwrapPayload(raw: unknown): Record<string, unknown> | null {
  const top = asRecord(raw);
  if (!top) return null;
  const data = top["data"];
  const inner = asRecord(data);
  if (
    inner &&
    ("invoiceRequestId" in inner ||
      "invoice_request_id" in inner ||
      "noOp" in inner ||
      "no_op" in inner)
  ) {
    return inner;
  }
  if ("invoiceRequestId" in top || "invoice_request_id" in top || "noOp" in top || "no_op" in top) {
    return top;
  }
  return top;
}

export function normalizeCancelInvoiceRequestResponse(raw: unknown): CancelInvoiceRequestResponse {
  const obj = unwrapPayload(raw);
  if (!obj) {
    return { invoiceRequestId: "", noOp: false };
  }
  const invoiceRequestId = pickString(obj, "invoiceRequestId", "invoice_request_id") ?? "";
  const noOp = pickBoolean(obj, "noOp", "no_op");
  const out: CancelInvoiceRequestResponse = { invoiceRequestId, noOp };
  const status = pickString(obj, "status", "status");
  const message = pickString(obj, "message", "message");
  if (status !== undefined) out.status = status;
  if (message !== undefined) out.message = message;
  return out;
}
