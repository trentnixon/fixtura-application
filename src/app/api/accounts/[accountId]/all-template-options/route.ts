import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF for GET /api/accounts/:accountId/all-template-options → Strapi full template catalog + optional currentSelection.
 * Forwards optional query `templateOptionId` when it is a positive integer (else 400).
 * @see .comms/data-fetching/handoff/handoff-template-all-template-options.md
 */
export async function GET(request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  const incoming = new URL(request.url).searchParams;
  const rawTemplateOptionId = incoming.get("templateOptionId");
  const search = new URLSearchParams();
  search.set("accountId", accountId);

  if (rawTemplateOptionId !== null && rawTemplateOptionId !== "") {
    const n = Number(rawTemplateOptionId);
    if (!Number.isInteger(n) || n <= 0) {
      return NextResponse.json({ error: "Invalid templateOptionId" }, { status: 400 });
    }
    search.set("templateOptionId", String(n));
  }

  const qs = search.toString();

  try {
    const strapiRes = await fetch(
      `${strapiUrl}/api/template-categories/all-template-options?${qs}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const contentType = strapiRes.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await strapiRes.json() : await strapiRes.text();

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
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
