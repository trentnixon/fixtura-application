import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * BFF: GET /api/account/onboarding/lookups/sports → Strapi L1.
 * @see create-organisation/.comms/phase-2/app-handoff-onboarding-phase2-l1-l2-w1.md
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
    const strapiRes = await fetch(`${strapiUrl}/api/account/onboarding/lookups/sports`, {
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
