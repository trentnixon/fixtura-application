import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

const ENTITY_TYPES = new Set(["club", "team", "grade"]);

type RouteContext = {
  params: Promise<{
    accountId: string;
    sponsorId: string;
    entityType: string;
    entityId: string;
    allocationId: string;
  }>;
};

function sponsorsEntityAllocationUrl(
  accountId: string,
  sponsorId: string,
  entityType: string,
  entityId: string,
  allocationId: string,
  strapiUrl: string,
) {
  return `${strapiUrl}/api/accounts/${encodeURIComponent(accountId)}/sponsors/${encodeURIComponent(sponsorId)}/allocations/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}/${encodeURIComponent(allocationId)}`;
}

/**
 * BFF: PATCH | DELETE …/allocations/entity/:entityType/:entityId/:allocationId
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { accountId, sponsorId, entityType, entityId, allocationId } = await context.params;
  if (
    !isValidPositiveIntSegment(sponsorId) ||
    !isValidPositiveIntSegment(entityId) ||
    !isValidPositiveIntSegment(allocationId)
  ) {
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
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      cache: "no-store",
    };
    if (bodyText.length > 0) init.body = bodyText;
    const strapiRes = await fetch(
      sponsorsEntityAllocationUrl(
        accountId,
        sponsorId,
        et,
        entityId,
        allocationId,
        guard.strapiUrl,
      ),
      init,
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { accountId, sponsorId, entityType, entityId, allocationId } = await context.params;
  if (
    !isValidPositiveIntSegment(sponsorId) ||
    !isValidPositiveIntSegment(entityId) ||
    !isValidPositiveIntSegment(allocationId)
  ) {
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
      sponsorsEntityAllocationUrl(
        accountId,
        sponsorId,
        et,
        entityId,
        allocationId,
        guard.strapiUrl,
      ),
      {
        method: "DELETE",
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
