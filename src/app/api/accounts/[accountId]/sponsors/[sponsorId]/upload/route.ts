import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string; sponsorId: string }> };

/**
 * BFF: POST /api/accounts/:accountId/sponsors/:sponsorId/upload (multipart → Strapi).
 * @see .comms/data-fetching/request/app-handoff-account-sponsors-and-allocations-crud.md
 */
export async function POST(request: Request, context: RouteContext) {
  const { accountId, sponsorId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId)) {
    return NextResponse.json({ error: "Invalid sponsor id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  try {
    const rawBody = await request.arrayBuffer();
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}/upload`,
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
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
