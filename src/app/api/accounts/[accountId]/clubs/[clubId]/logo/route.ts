import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string; clubId: string }> };

function clubLogoUrl(accountId: string, clubId: string, strapiUrl: string) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/clubs/${encodeURIComponent(clubId)}/logo`;
}

/**
 * BFF: PATCH /api/accounts/:accountId/clubs/:clubId/logo
 * Association-scoped club logo persist/clear (W2).
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { accountId, clubId } = await context.params;
  if (!isValidPositiveIntSegment(clubId)) {
    return NextResponse.json({ error: "Invalid club id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const strapiRes = await fetch(clubLogoUrl(accountId, clubId, guard.strapiUrl), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
