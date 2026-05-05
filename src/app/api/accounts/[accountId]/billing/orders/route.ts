import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  forwardOrdersByAccountToStrapi,
  jsonFromStrapiResponse,
  nextResponseFromStrapi,
} from "@/app/api/accounts/[accountId]/billing/_billing-strapi-proxy";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

async function billingOrdersRequestGuard(
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
 * BFF for GET /api/accounts/:accountId/billing/orders → Strapi GET /api/orders/account/:accountId.
 * @see src/app/(members)/o/[accountId]/billing/.comms/response/frontend-handoff-orders-by-account-endpoint.md
 */
export async function GET(_request: Request, context: RouteContext) {
  const guard = await billingOrdersRequestGuard(context);
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const strapiRes = await forwardOrdersByAccountToStrapi(
      guard.strapiUrl,
      guard.accountId,
      guard.token,
      { method: "GET" },
    );
    const payload = await jsonFromStrapiResponse(strapiRes);
    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
