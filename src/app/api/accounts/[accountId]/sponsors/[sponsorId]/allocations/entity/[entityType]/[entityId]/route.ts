import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

const ENTITY_TYPES = new Set(["club", "team", "grade"]);

type RouteContext = {
  params: Promise<{ accountId: string; sponsorId: string; entityType: string; entityId: string }>;
};

function sponsorsEntityBase(
  accountId: string,
  sponsorId: string,
  entityType: string,
  entityId: string,
  strapiUrl: string,
) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}/allocations/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`;
}

/**
 * BFF: GET | POST …/allocations/entity/:entityType/:entityId
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId, sponsorId, entityType, entityId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId) || !isValidPositiveIntSegment(entityId)) {
    return NextResponse.json({ error: "Invalid path id" }, { status: 400 });
  }
  const et = entityType.toLowerCase();
  if (!ENTITY_TYPES.has(et)) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(
      sponsorsEntityBase(accountId, sponsorId, et, entityId, guard.strapiUrl),
      {
        headers: {
          Authorization: `Bearer ${guard.token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { accountId, sponsorId, entityType, entityId } = await context.params;
  if (!isValidPositiveIntSegment(sponsorId) || !isValidPositiveIntSegment(entityId)) {
    return NextResponse.json({ error: "Invalid path id" }, { status: 400 });
  }
  const et = entityType.toLowerCase();
  if (!ENTITY_TYPES.has(et)) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const contentType = request.headers.get("content-type") ?? "application/json";
    const bodyText = await request.text();
    const init: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      cache: "no-store",
    };
    if (bodyText.length > 0) init.body = bodyText;
    const strapiRes = await fetch(
      sponsorsEntityBase(accountId, sponsorId, et, entityId, guard.strapiUrl),
      init,
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
