import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string; slug: string[] }> };

/**
 * BFF: GET /api/season-hub/:accountId/* → Strapi season-hub read model (cookie → Bearer).
 * Preserves Strapi JSON on errors so clients can read `SEASON_HUB_*` via ApiError.details.
 * @see src/app/(members)/o/[accountId]/season/.docs/request/frontend-handoff.md
 */
export async function GET(request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId, slug } = await context.params;

  if (!token) {
    return NextResponse.json(
      { error: { code: "SEASON_HUB_AUTH_REQUIRED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json(
      { error: { code: "SEASON_HUB_BAD_REQUEST", message: "Invalid account id" } },
      { status: 400 },
    );
  }

  if (!slug || slug.length === 0) {
    return NextResponse.json(
      { error: { code: "SEASON_HUB_BAD_REQUEST", message: "Missing season-hub path" } },
      { status: 400 },
    );
  }

  if (!strapiUrl) {
    return NextResponse.json(
      { error: { code: "SEASON_HUB_INTERNAL_ERROR", message: "Service unavailable" } },
      { status: 503 },
    );
  }

  const upstreamPath = slug.map((s) => encodeURIComponent(s)).join("/");
  const url = new URL(request.url);
  const search = url.search;
  const strapiHref = `${strapiUrl}/api/season-hub/${encodeURIComponent(accountId)}/${upstreamPath}${search}`;

  try {
    const strapiRes = await fetch(strapiHref, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = strapiRes.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await strapiRes.json() : await strapiRes.text();

    if (!strapiRes.ok) {
      if (typeof payload === "object" && payload !== null) {
        return NextResponse.json(payload, { status: strapiRes.status });
      }
      return NextResponse.json(
        {
          error: {
            code: "SEASON_HUB_INTERNAL_ERROR",
            message: String(payload).trim() || "Strapi error",
          },
        },
        { status: strapiRes.status },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: { code: "SEASON_HUB_INTERNAL_ERROR", message: "Unexpected server error" } },
      { status: 500 },
    );
  }
}
