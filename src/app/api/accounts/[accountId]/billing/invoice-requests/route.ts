import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  forwardAccountBillingToStrapi,
  jsonFromStrapiResponse,
  nextResponseFromStrapi,
} from "@/app/api/accounts/[accountId]/billing/_billing-strapi-proxy";
import { normalizeInvoiceRequestPostBody } from "@/app/api/accounts/[accountId]/billing/invoice-requests/normalize-invoice-request-post-body";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

async function billingRequestGuard(
  context: RouteContext,
): Promise<
  | { ok: true; strapiUrl: string; token: string; accountId: string }
  | { ok: false; response: NextResponse }
> {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId } = await context.params;

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isValidAccountIdSegment(accountId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid account id" }, { status: 400 }),
    };
  }

  if (!strapiUrl) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Service unavailable" }, { status: 500 }),
    };
  }

  return { ok: true, strapiUrl, token, accountId };
}

/**
 * BFF for GET /api/accounts/:accountId/billing/invoice-requests → Strapi.
 * @see src/app/(members)/o/[accountId]/billing/.comms/frontend-billing-api-contract-handoff.md
 */
export async function GET(_request: Request, context: RouteContext) {
  const guard = await billingRequestGuard(context);
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const strapiRes = await forwardAccountBillingToStrapi(
      guard.strapiUrl,
      guard.accountId,
      guard.token,
      "invoice-requests",
      { method: "GET" },
    );
    const payload = await jsonFromStrapiResponse(strapiRes);
    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * BFF for POST /api/accounts/:accountId/billing/invoice-requests → Strapi.
 */
export async function POST(request: Request, context: RouteContext) {
  const guard = await billingRequestGuard(context);
  if (!guard.ok) {
    return guard.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const normalized = normalizeInvoiceRequestPostBody(body as Record<string, unknown>);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.message }, { status: 400 });
  }

  try {
    const strapiRes = await forwardAccountBillingToStrapi(
      guard.strapiUrl,
      guard.accountId,
      guard.token,
      "invoice-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized.body),
      },
    );

    const payload = await jsonFromStrapiResponse(strapiRes);
    if (!strapiRes.ok && typeof payload === "object" && payload !== null && "error" in payload) {
      return NextResponse.json(payload as Record<string, unknown>, { status: strapiRes.status });
    }

    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
