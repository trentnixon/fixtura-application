import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardStrapiRequest } from "@/lib/api/bff/guard-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";
import { parseJsonBodyOrEmpty } from "@/lib/api/bff/parse-json-body-or-empty";

/**
 * BFF proxy for A1 — create or attach first account (zero-account users).
 * Upstream: POST {STRAPI_URL}/api/account/first (see create-organisation/.comms/phase-1/app-handoff-post-account-first-endpoint.md).
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
