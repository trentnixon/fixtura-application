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
  id?: unknown;
  accountId?: unknown;
};

/**
 * BFF: POST /api/grade/trigger-fixture-discovery
 * Upstream: POST {STRAPI}/api/grade/trigger-fixture-discovery
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

  const id = parsePositiveIntField(payload?.id);
  if (!id) {
    return visionScrapeBadRequest("id must be a positive integer");
  }

  const accountIdResult = parseOptionalAccountId(payload?.accountId);
  if (!accountIdResult.ok) {
    return visionScrapeBadRequest("accountId must be a positive integer when provided");
  }

  const upstreamBody: Record<string, unknown> = { id };
  if (accountIdResult.value != null) {
    upstreamBody["accountId"] = accountIdResult.value;
  }

  return forwardVisionScrapePost({
    strapiUrl,
    upstreamPath: "/api/grade/trigger-fixture-discovery",
    token,
    upstreamBody,
  });
}
