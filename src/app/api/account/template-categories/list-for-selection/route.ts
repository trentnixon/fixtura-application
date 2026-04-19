import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * BFF: GET /api/account/template-categories/list-for-selection → Strapi published categories for dropdowns (includes private).
 * @see .comms/data-fetching/handoff/handoff-list-for-selection.md
 */
export async function GET() {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/template-categories/list-for-selection`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

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
