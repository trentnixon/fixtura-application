import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

/**
 * BFF: GET /api/account/onboarding/lookups/associations?sport= — associations for a sport (onboarding Step 1).
 * Upstream: GET {STRAPI}/api/account/onboarding/lookups/associations?sport=
 */
export async function GET(request: Request) {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  if (!sport || sport.trim() === "") {
    return NextResponse.json({ error: "Missing sport query parameter" }, { status: 400 });
  }

  const upstream = new URL(`${guard.strapiUrl}/api/account/onboarding/lookups/associations`);
  upstream.searchParams.set("sport", sport);

  try {
    const strapiRes = await fetch(upstream.toString(), {
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
