import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF: POST /api/accounts/:accountId/onboarding/step-2/upload → Strapi M1 (multipart).
 * @see create-organisation/.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md
 */
export async function POST(request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  try {
    const rawBody = await request.arrayBuffer();
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/onboarding/step-2/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
          "Content-Type": contentType,
        },
        body: rawBody,
        cache: "no-store",
      },
    );

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
