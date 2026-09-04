import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  forwardVisionScrapePost,
  parseOptionalAccountId,
  parsePositiveIntField,
  visionScrapeBadRequest,
} from "@/app/api/_utils/forward-vision-scrape-post";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

type TriggerPayload = {
  associationId?: unknown;
  accountId?: unknown;
};

/**
 * BFF: POST /api/association-overview-queues/trigger-association-single-scrape
 * Upstream: POST {STRAPI}/api/association-overview-queues/trigger-association-single-scrape
 */
export async function POST(request: Request) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let payload: TriggerPayload;
  try {
    payload = (await request.json()) as TriggerPayload;
  } catch {
    return visionScrapeBadRequest("Request body must be valid JSON");
  }

  const associationId = parsePositiveIntField(payload?.associationId);
  if (!associationId) {
    return visionScrapeBadRequest("associationId must be a positive integer");
  }

  const accountIdResult = parseOptionalAccountId(payload?.accountId);
  if (!accountIdResult.ok) {
    return visionScrapeBadRequest("accountId must be a positive integer when provided");
  }

  const upstreamBody: Record<string, unknown> = { associationId };
  if (accountIdResult.value != null) {
    upstreamBody["accountId"] = accountIdResult.value;
  }

  return forwardVisionScrapePost({
    strapiUrl,
    upstreamPath: "/api/association-overview-queues/trigger-association-single-scrape",
    token,
    upstreamBody,
  });
}
