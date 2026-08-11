import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import {
  guardAccountStrapiRequest,
  isValidPositiveIntSegment,
} from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string; mediaId: string }> };

function mediaLibraryItemPath(accountId: string, mediaId: string): string {
  return `/api/accounts/${encodeURIComponent(accountId)}/media-library/${encodeURIComponent(mediaId)}`;
}

/**
 * BFF for GET|PATCH|DELETE /api/accounts/:accountId/media-library/:mediaId
 * @see .comms/Monday.com/Media Library - 2785542088/app-handoff-account-media-library-v1-implementation.md
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId, mediaId } = await context.params;
  if (!isValidPositiveIntSegment(mediaId)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(`${guard.strapiUrl}${mediaLibraryItemPath(accountId, mediaId)}`, {
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

export async function PATCH(request: Request, context: RouteContext) {
  const { accountId, mediaId } = await context.params;
  if (!isValidPositiveIntSegment(mediaId)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
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
      `${guard.strapiUrl}${mediaLibraryItemPath(accountId, mediaId)}`,
      init,
    );
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { accountId, mediaId } = await context.params;
  if (!isValidPositiveIntSegment(mediaId)) {
    return NextResponse.json({ error: "Invalid media id" }, { status: 400 });
  }
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(`${guard.strapiUrl}${mediaLibraryItemPath(accountId, mediaId)}`, {
      method: "DELETE",
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
