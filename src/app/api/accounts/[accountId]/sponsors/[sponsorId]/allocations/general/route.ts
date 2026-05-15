import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string; sponsorId: string }> };

function sponsorsGeneralBase(accountId: string, sponsorId: string, strapiUrl: string) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}/allocations/general`;
}

/**
 * BFF: GET | POST …/allocations/general
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId, sponsorId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId)) {
    return NextResponse.json({ error: "Invalid sponsor id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(sponsorsGeneralBase(accountId, sponsorId, guard.strapiUrl), {
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { accountId, sponsorId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId)) {
    return NextResponse.json({ error: "Invalid sponsor id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const contentType = request.headers.get("content-type") ?? "application/json";
    const bodyText = await request.text();
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      cache: "no-store",
    };
    if (bodyText.length > 0) init.body = bodyText;
    const strapiRes = await fetch(sponsorsGeneralBase(accountId, sponsorId, guard.strapiUrl), init);
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
