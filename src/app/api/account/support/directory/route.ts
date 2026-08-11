import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

/**
 * BFF: GET /api/account/support/directory → Strapi support super-user account directory.
 * @see .comms/API/handoff/cms-handoff-support-super-user-phase5-app-integration.md
 */
export async function GET(request: Request) {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  try {
    const search = new URL(request.url).search;
    const strapiRes = await fetch(`${guard.strapiUrl}/api/account/support/directory${search}`, {
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
