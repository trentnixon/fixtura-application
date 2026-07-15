import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";
import { parseJsonBodyOrEmpty } from "@/lib/api/bff/parse-json-body-or-empty";

/**
 * BFF proxy for POST /api/account/first — obtain the authenticated user's reusable blank account.
 * Upstream returns 201 (created), 200 (reused blank), or 503 ACCOUNT_CREATE_BUSY with Retry-After.
 * Both 200 and 201 bodies are `{ data: { accountId } }` and are equivalent success for the caller.
 */
export async function POST(request: Request) {
  const guard = await guardStrapiRequest();
  if (!guard.ok) return guard.response;

  const parsed = await parseJsonBodyOrEmpty(request);
  if (!parsed.ok) return parsed.response;

  try {
    const strapiRes = await fetch(`${guard.strapiUrl}/api/account/first`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.body ?? {}),
      cache: "no-store",
    });

    return nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
