import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

/**
 * BFF: GET /api/account/onboarding/lookups/clubs?associationId= — clubs under an association.
 * Upstream: GET {STRAPI}/api/account/onboarding/lookups/clubs?associationId=
 */
export async function GET(request: Request) {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const associationId = searchParams.get("associationId");
  if (!associationId || associationId.trim() === "") {
    return NextResponse.json({ error: "Missing associationId query parameter" }, { status: 400 });
  }

  const upstream = new URL(`${guard.strapiUrl}/api/account/onboarding/lookups/clubs`);
  upstream.searchParams.set("associationId", associationId);

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
