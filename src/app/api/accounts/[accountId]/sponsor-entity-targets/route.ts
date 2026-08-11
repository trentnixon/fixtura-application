import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

function sponsorEntityTargetsUrl(accountId: string, strapiUrl: string) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsor-entity-targets`;
}

/**
 * BFF: GET /api/accounts/:accountId/sponsor-entity-targets
 * Proxies the CMS account-scoped catalogue of sponsor-assignable club/team/grade targets.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(sponsorEntityTargetsUrl(accountId, guard.strapiUrl), {
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
