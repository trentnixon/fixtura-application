import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * BFF proxy for A1 — create or attach first account (zero-account users).
 * Upstream: POST {STRAPI_URL}/api/account/first (see create-organisation/.comms/phase-1/app-handoff-post-account-first-endpoint.md).
 */
export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: unknown = {};
  const contentType = request.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/account/first`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });

    const resContentType = strapiRes.headers.get("content-type");
    const isJson = resContentType?.includes("application/json");
    const payload = isJson ? await strapiRes.json() : await strapiRes.text();

    if (!strapiRes.ok) {
      if (typeof payload === "object" && payload !== null) {
        return NextResponse.json(payload, { status: strapiRes.status });
      }
      return NextResponse.json(
        { error: typeof payload === "string" ? payload : "Strapi error" },
        { status: strapiRes.status },
      );
    }

    // Pass through 200 (idempotent) vs 201 (first create) per handoff
    return NextResponse.json(payload, { status: strapiRes.status });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
