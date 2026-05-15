import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string; sponsorId: string }> };

/**
 * BFF: PATCH / DELETE /api/accounts/:accountId/sponsors/:sponsorId
 * @see .comms/data-fetching/request/app-handoff-account-sponsors-and-allocations-crud.md
 */
export async function PATCH(request: Request, context: RouteContext) {
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
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      cache: "no-store",
    };
    if (bodyText.length > 0) init.body = bodyText;
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}`,
      init,
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { accountId, sponsorId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId)) {
    return NextResponse.json({ error: "Invalid sponsor id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
