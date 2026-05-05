import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";

export type AccountBillingStrapiSubpath =
  | "available-tiers"
  | "checkout"
  | "invoice-requests"
  | "start-trial";

export function strapiAccountBillingUrl(
  strapiUrl: string,
  accountId: string,
  subpath?: AccountBillingStrapiSubpath,
): string {
  const base = `${strapiUrl}/api/accounts/${accountId}/billing`;
  return subpath ? `${base}/${subpath}` : base;
}

export async function forwardAccountBillingToStrapi(
  strapiUrl: string,
  accountId: string,
  token: string,
  subpath: AccountBillingStrapiSubpath | undefined,
  init: RequestInit,
): Promise<Response> {
  return fetch(strapiAccountBillingUrl(strapiUrl, accountId, subpath), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

/** Strapi custom route: GET /api/orders/account/:accountId (camelCase order rows). */
export function strapiOrdersByAccountUrl(strapiUrl: string, accountId: string): string {
  return `${strapiUrl}/api/orders/account/${encodeURIComponent(accountId)}`;
}

export async function forwardOrdersByAccountToStrapi(
  strapiUrl: string,
  accountId: string,
  token: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(strapiOrdersByAccountUrl(strapiUrl, accountId), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function jsonFromStrapiResponse(strapiRes: Response): Promise<unknown> {
  const contentType = strapiRes.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  return isJson ? await strapiRes.json() : await strapiRes.text();
}

export function nextResponseFromStrapi(strapiRes: Response, payload: unknown): NextResponse {
  if (!strapiRes.ok) {
    let message: string;
    if (typeof payload === "object" && payload !== null && "error" in payload) {
      const raw = (payload as { error?: unknown }).error;
      message = normalizeErrorFieldToString(raw) ?? "Strapi error";
    } else if (typeof payload === "string") {
      message = payload.trim() || "Strapi error";
    } else {
      message = "Strapi error";
    }
    return NextResponse.json({ error: message }, { status: strapiRes.status });
  }

  return NextResponse.json(payload);
}
