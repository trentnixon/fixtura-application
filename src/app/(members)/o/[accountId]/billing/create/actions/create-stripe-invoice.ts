"use server";

import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { fetchStrapiWithAuthCookie } from "@/lib/strapi/server";

/** Strapi canonical body (field names are case-sensitive per handoff). */
export type StrapiCreateStripeInvoiceBody = {
  AccountID: number | string;
  product_id: number | string;
  startDate: string;
  endDate: string;
  couponId?: string | null;
};

export type StrapiCreateStripeInvoiceOk = {
  ok: true;
  message: string;
  invoiceId: string;
  customerId: number;
  orderId: number;
};

export type StrapiCreateStripeInvoiceErr = {
  ok: false;
  status: number;
  message: string;
};

export type StrapiCreateStripeInvoiceResult =
  StrapiCreateStripeInvoiceOk | StrapiCreateStripeInvoiceErr;

function strapiErrorMessage(payload: unknown): string {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload.trim();
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const err = o["error"];
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err) {
      const m = (err as { message?: unknown }).message;
      if (typeof m === "string" && m.length > 0) return m;
    }
    const msg = o["message"];
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return "Unable to create Stripe invoice.";
}

/**
 * Calls Strapi `POST /api/orders/stripe/create-invoice`.
 * Requires staff JWT + Users & Permissions (`api::order.order.createStripeInvoice`).
 * `routeAccountId` must match `body.AccountID` — body alone cannot switch organisation.
 */
export async function createStrapiStripeInvoice(
  routeAccountId: string,
  body: StrapiCreateStripeInvoiceBody,
): Promise<StrapiCreateStripeInvoiceResult> {
  if (!isValidAccountIdSegment(routeAccountId)) {
    return { ok: false, status: 400, message: "Invalid organisation id." };
  }

  if (String(body.AccountID) !== String(routeAccountId)) {
    return {
      ok: false,
      status: 400,
      message: "Organisation id does not match the current route.",
    };
  }

  const { AccountID, product_id, startDate, endDate, couponId } = body;

  if (startDate.trim().length === 0 || endDate.trim().length === 0) {
    return { ok: false, status: 400, message: "Start date and end date are required." };
  }

  const payload: Record<string, unknown> = {
    AccountID,
    product_id,
    startDate: startDate.trim(),
    endDate: endDate.trim(),
  };

  const couponTrimmed = couponId?.trim();
  if (couponTrimmed !== undefined && couponTrimmed !== null && couponTrimmed.length > 0) {
    payload["couponId"] = couponTrimmed;
  }

  let res: Response;
  try {
    res = await fetchStrapiWithAuthCookie("/api/orders/stripe/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      status: 503,
      message: "Billing service unreachable. Try again shortly.",
    };
  }

  const raw = await res.text();
  let json: unknown;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = raw;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: strapiErrorMessage(json ?? raw),
    };
  }

  if (!json || typeof json !== "object") {
    return {
      ok: false,
      status: 502,
      message: "Unexpected response while creating Stripe invoice.",
    };
  }

  const o = json as Record<string, unknown>;
  const orderIdRaw = o["orderId"] ?? o["OrderID"];
  const invoiceId = o["invoiceId"] ?? o["invoice_id"];
  const customerIdRaw = o["customerId"] ?? o["CustomerID"] ?? o["customerID"];
  const message = typeof o["message"] === "string" ? o["message"] : "Invoice created.";

  if (typeof invoiceId !== "string" || invoiceId.trim().length === 0) {
    return {
      ok: false,
      status: 502,
      message: "Server response missing invoice id.",
    };
  }

  const orderIdNum = typeof orderIdRaw === "number" ? orderIdRaw : Number(orderIdRaw);
  const customerNum = typeof customerIdRaw === "number" ? customerIdRaw : Number(customerIdRaw);

  if (!Number.isFinite(orderIdNum) || orderIdNum <= 0) {
    return {
      ok: false,
      status: 502,
      message: "Server response missing order id.",
    };
  }

  if (!Number.isFinite(customerNum)) {
    return {
      ok: false,
      status: 502,
      message: "Server response missing customer id.",
    };
  }

  return {
    ok: true,
    message,
    invoiceId: invoiceId.trim(),
    customerId: Math.trunc(customerNum),
    orderId: Math.trunc(orderIdNum),
  };
}
