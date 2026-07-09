import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";
import { parseJsonBodyOrEmpty } from "@/lib/api/bff/parse-json-body-or-empty";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * BFF: POST /api/accounts/:accountId/onboarding/confirm → Strapi W4.
 * @see create-organisation/.comms/phase-5/app-handoff-onboarding-phase5-w4.md
 */
export async function POST(request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodyOrEmpty(request);
  if (!parsed.ok) return parsed.response;

  try {
    const strapiRes = await fetch(
      `${guard.strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/onboarding/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.body ?? {}),
        cache: "no-store",
      },
    );

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
