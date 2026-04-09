import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * BFF: GET /api/account/onboarding/lookups/clubs?associationId= — clubs under an association.
 * Upstream: GET {STRAPI}/api/account/onboarding/lookups/clubs?associationId=
 */
export async function GET(request: Request) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const associationId = searchParams.get("associationId");
  if (!associationId || associationId.trim() === "") {
    return NextResponse.json({ error: "Missing associationId query parameter" }, { status: 400 });
  }

  const upstream = new URL(`${strapiUrl}/api/account/onboarding/lookups/clubs`);
  upstream.searchParams.set("associationId", associationId);

  try {
    const strapiRes = await fetch(upstream.toString(), {
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
      if (typeof payload === "object" && payload !== null) {
        return NextResponse.json(payload, { status: strapiRes.status });
      }
      return NextResponse.json(
        { error: typeof payload === "string" ? payload : "Strapi error" },
        { status: strapiRes.status },
      );
    }

    return NextResponse.json(payload, { status: strapiRes.status });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
