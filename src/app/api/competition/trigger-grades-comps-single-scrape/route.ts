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
  competitionId?: unknown;
  accountId?: unknown;
};

/**
 * BFF: POST /api/competition/trigger-grades-comps-single-scrape
 * Upstream: POST {STRAPI}/api/competition/trigger-grades-comps-single-scrape
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

  const competitionId = parsePositiveIntField(payload?.competitionId);
  if (!competitionId) {
    return visionScrapeBadRequest("competitionId must be a positive integer");
  }

  const accountIdResult = parseOptionalAccountId(payload?.accountId);
  if (!accountIdResult.ok) {
    return visionScrapeBadRequest("accountId must be a positive integer when provided");
  }

  const upstreamBody: Record<string, unknown> = { competitionId };
  if (accountIdResult.value != null) {
    upstreamBody["accountId"] = accountIdResult.value;
  }

  return forwardVisionScrapePost({
    strapiUrl,
    upstreamPath: "/api/competition/trigger-grades-comps-single-scrape",
    token,
    upstreamBody,
  });
}
