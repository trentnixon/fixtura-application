import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  forwardAccountBillingToStrapi,
  jsonFromStrapiResponse,
  nextResponseFromStrapi,
} from "@/app/api/accounts/[accountId]/billing/_billing-strapi-proxy";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF for POST /api/accounts/:accountId/billing/start-trial → Strapi assigns free trial when eligible.
 * @see src/app/(members)/o/[accountId]/billing/.comms/planning/free-trial-status-identification-ui-modes.md
 */
export async function POST(_request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  try {
    const strapiRes = await forwardAccountBillingToStrapi(
      strapiUrl,
      accountId,
      token,
      "start-trial",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
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
