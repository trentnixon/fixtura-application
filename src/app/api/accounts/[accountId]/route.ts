import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF: DELETE /api/accounts/:accountId → Strapi Epic 6 unfinished-account delete.
 * @see .comms/CODEX/EPIC_6_APP_WORKPLAN.md
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
