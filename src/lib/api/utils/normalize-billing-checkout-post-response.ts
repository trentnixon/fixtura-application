/**
 * Strapi custom billing routes may return camelCase (per handoff) or snake_case.
 * Some responses wrap the payload in `{ data: … }`. Normalize before the UI reads `checkoutUrl`.
 */

import type {
  CreateCheckoutResponse,
  DeletePendingOrderResponse,
  ResumeCheckoutResponse,
} from "@/types/api/account";

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

function unwrapCheckoutPayload(raw: unknown): Record<string, unknown> | null {
  const top = asRecord(raw);
  if (!top) return null;

  const data = top["data"];
  const inner = asRecord(data);
  if (
    inner &&
    ("checkoutUrl" in inner ||
      "checkout_url" in inner ||
      "checkoutSessionId" in inner ||
      "checkout_session_id" in inner ||
      "orderId" in inner ||
      "order_id" in inner)
  ) {
    return inner;
  }

  return top;
}

function unwrapDeletePendingPayload(raw: unknown): Record<string, unknown> | null {
  const top = asRecord(raw);
  if (!top) return null;
  const data = top["data"];
  const inner = asRecord(data);
  if (inner && ("orderId" in inner || "order_id" in inner || "noOp" in inner || "no_op" in inner)) {
    return inner;
  }
  if ("orderId" in top || "order_id" in top || "noOp" in top || "no_op" in top) {
    return top;
  }
  return top;
}

export function normalizeDeletePendingOrderResponse(raw: unknown): DeletePendingOrderResponse {
  const obj = unwrapDeletePendingPayload(raw);
  if (!obj) {
    return { orderId: "", noOp: false };
  }
  const orderId = pickString(obj, "orderId", "order_id") ?? "";
  const noOp = pickBoolean(obj, "noOp", "no_op");
  const checkoutStatus = pickString(obj, "checkoutStatus", "checkout_status");
  const stripeSessionExpired = pickBoolean(obj, "stripeSessionExpired", "stripe_session_expired");
  const out: DeletePendingOrderResponse = { orderId, noOp };
  if (checkoutStatus !== undefined) {
    out.checkoutStatus = checkoutStatus;
  }
  if (stripeSessionExpired) {
    out.stripeSessionExpired = true;
  }
  return out;
}

export function normalizeCreateCheckoutResponse(raw: unknown): CreateCheckoutResponse {
  const obj = unwrapCheckoutPayload(raw);
  if (!obj) {
    return { checkoutSessionId: "", orderId: "" };
  }
  const checkoutSessionId = pickString(obj, "checkoutSessionId", "checkout_session_id") ?? "";
  const orderId = pickString(obj, "orderId", "order_id") ?? "";
  const checkoutUrl = pickString(obj, "checkoutUrl", "checkout_url");
  return {
    checkoutSessionId,
    orderId,
    ...(checkoutUrl !== undefined ? { checkoutUrl } : {}),
  };
}

export function normalizeResumeCheckoutResponse(raw: unknown): ResumeCheckoutResponse {
  const obj = unwrapCheckoutPayload(raw);
  if (!obj) {
    return {
      checkoutSessionId: "",
      orderId: "",
      reusedExisting: false,
    };
  }
  const checkoutSessionId = pickString(obj, "checkoutSessionId", "checkout_session_id") ?? "";
  const orderId = pickString(obj, "orderId", "order_id") ?? "";
  const checkoutUrl = pickString(obj, "checkoutUrl", "checkout_url");
  const reusedExisting = pickBoolean(obj, "reusedExisting", "reused_existing");
  return {
    checkoutSessionId,
    orderId,
    reusedExisting,
    ...(checkoutUrl !== undefined ? { checkoutUrl } : {}),
  };
}
