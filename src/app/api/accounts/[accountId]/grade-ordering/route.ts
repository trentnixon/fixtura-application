import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

function gradeOrderingUrl(accountId: string, strapiUrl: string, request: Request) {
  const incoming = new URL(request.url);
  const target = new URL(
    `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/grade-ordering`,
  );
  const organisationType = incoming.searchParams.get("organisationType");
  const organisationId = incoming.searchParams.get("organisationId");
  if (organisationType) target.searchParams.set("organisationType", organisationType);
  if (organisationId) target.searchParams.set("organisationId", organisationId);
  return target.toString();
}

/**
 * BFF: GET /api/accounts/:accountId/grade-ordering
 * Proxies CMS account-scoped grade ordering (requires organisationType + organisationId query).
 */
export async function GET(request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(gradeOrderingUrl(accountId, guard.strapiUrl, request), {
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

/**
 * BFF: PUT /api/accounts/:accountId/grade-ordering
 * Atomically replaces reachable custom grade ordering for the organisation scope.
 */
export async function PUT(request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  try {
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/grade-ordering`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
