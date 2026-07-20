import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { guardAccountStrapiRequest } from "@/lib/api/bff/guard-account-strapi-request";
import { nextResponseFromStrapiFetch } from "@/lib/api/bff/next-response-from-strapi-fetch";

type RouteContext = { params: Promise<{ accountId: string }> };

function mediaLibraryBasePath(accountId: string): string {
  return `/api/accounts/${encodeURIComponent(accountId)}/media-library`;
}

/**
 * BFF for GET|POST /api/accounts/:accountId/media-library
 * @see .comms/Monday.com/Media Library - 2785542088/app-handoff-account-media-library-v1-implementation.md
 */
export async function GET(_request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  try {
    const strapiRes = await fetch(`${guard.strapiUrl}${mediaLibraryBasePath(accountId)}`, {
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

export async function POST(request: Request, context: RouteContext) {
  const { accountId } = await context.params;
  const guard = await guardAccountStrapiRequest(accountId);
  if (!guard.ok) return guard.response;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  try {
    const rawBody = await request.arrayBuffer();
    const strapiRes = await fetch(`${guard.strapiUrl}${mediaLibraryBasePath(accountId)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${guard.token}`,
        Accept: "application/json",
        "Content-Type": contentType,
      },
      body: rawBody,
      cache: "no-store",
    });
    return await nextResponseFromStrapiFetch(strapiRes);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
