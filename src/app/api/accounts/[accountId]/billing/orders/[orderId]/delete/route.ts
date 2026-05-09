import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  forwardAccountBillingOrderDeleteToStrapi,
  jsonFromStrapiResponse,
  nextResponseFromStrapi,
} from "@/app/api/accounts/[accountId]/billing/_billing-strapi-proxy";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string; orderId: string }> };

/**
 * BFF for POST /api/accounts/:accountId/billing/orders/:orderId/delete → Strapi.
 * @see src/app/(members)/o/[accountId]/billing/.comms/handoff/responses/cms-handoff-delete-pending-order.md
 */
export async function POST(request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId, orderId } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  if (!isValidAccountIdSegment(orderId)) {
    return NextResponse.json(
      { error: { code: "INVALID_ORDER_ID", message: "Invalid order id" } },
      { status: 422 },
    );
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.trim() !== "") {
      const parsed = JSON.parse(text) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const strapiRes = await forwardAccountBillingOrderDeleteToStrapi(
      strapiUrl,
      accountId,
      orderId,
      token,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
