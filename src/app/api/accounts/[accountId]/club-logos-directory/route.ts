import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

function clubLogosDirectoryUrl(accountId: string, strapiUrl: string) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/club-logos-directory`;
}

/**
 * BFF: GET /api/accounts/:accountId/club-logos-directory
 * Proxies CMS account-scoped club directory for association Club Logos UI.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(clubLogosDirectoryUrl(accountId, guard.strapiUrl), {
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
