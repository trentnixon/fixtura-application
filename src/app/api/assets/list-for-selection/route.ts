import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * Strapi: GET /api/assets/list-for-selection (public). BFF proxies only to that path — no
 * `/api/assets/assets/...` variant. If Strapi returns 400 ("invalid asset id"), the `/:id` route is
 * matching before the custom route; fix route order in Strapi or use `path: "/list-for-selection"`
 * on the custom route so the URL stays `/api/assets/list-for-selection`.
 *
 * @see .comms/API/ASSETS-handoff-list-for-selection.md
 */
const STRAPI_ASSETS_LIST_FOR_SELECTION = "/api/assets/list-for-selection" as const;

function strapiErrorMessageFromPayload(payload: unknown): string {
  if (typeof payload === "object" && payload !== null) {
    const rec = payload as Record<string, unknown>;
    const fromTop =
      normalizeErrorFieldToString(rec["message"]) ?? normalizeErrorFieldToString(rec["error"]);
    if (fromTop) return fromTop;
  }
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  return "Strapi error";
}

const CMS_ASSETS_LIST_NOT_FOUND_MESSAGE =
  "The CMS returned 404 for GET /api/assets/list-for-selection. Check STRAPI_URL and that the route is deployed. See .comms/API/ASSETS-handoff-list-for-selection.md.";

/** Strapi matched GET /api/assets/:id (id = "list-for-selection") instead of the custom handler. */
const CMS_ASSETS_LIST_ROUTE_COLLISION_MESSAGE =
  "Could not load the asset list: Strapi is handling this URL as /api/assets/:id. Register the list-for-selection route before the :id route, or set the custom route path to `/list-for-selection` only. See .comms/API/ASSETS-handoff-list-for-selection.md.";

/**
 * BFF: GET /api/assets/list-for-selection → Strapi published assets for pickers.
 */
export async function GET() {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}${STRAPI_ASSETS_LIST_FOR_SELECTION}`, {
      headers,
      cache: "no-store",
    });

    const contentType = strapiRes.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await strapiRes.json() : await strapiRes.text();

    if (strapiRes.ok) {
      return NextResponse.json(payload);
    }

    const rawMessage = strapiErrorMessageFromPayload(payload);
    const message =
      strapiRes.status === 404
        ? CMS_ASSETS_LIST_NOT_FOUND_MESSAGE
        : strapiRes.status === 400 && /invalid asset id|must be a number/i.test(rawMessage)
          ? CMS_ASSETS_LIST_ROUTE_COLLISION_MESSAGE
          : rawMessage;

    return NextResponse.json({ error: message }, { status: strapiRes.status });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
