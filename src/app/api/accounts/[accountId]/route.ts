import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF: DELETE /api/accounts/:accountId → Strapi Epic 6 unfinished-account delete.
 * @see .comms/CODEX/EPIC_6_APP_WORKPLAN.md
 */
export async function DELETE(_request: Request, context: RouteContext) {
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
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const strapiRes = await fetch(`${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
