import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

/**
 * BFF: GET /api/account/onboarding/lookups/organisation-types → Strapi L2.
 * @see create-organisation/.comms/phase-2/app-handoff-onboarding-phase2-l1-l2-w1.md
 */
export async function GET() {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/account/onboarding/lookups/organisation-types`,
      {
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
