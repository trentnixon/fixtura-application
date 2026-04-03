import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

import type { AccountMeResponse } from "@/types/api/account";

/**
 * Proxy route for GET /api/account/me.
 * Proxies to Strapi's /api/account/me which resolves the account via JWT.
 */
export async function GET(request: NextRequest) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pass through the 'depth' query parameter if present
  const searchParams = request.nextUrl.searchParams;
  const depth = searchParams.get("depth");
  const strapiPath = depth ? `/api/account/me?depth=${depth}` : "/api/account/me";

  try {
    const strapiRes = await fetch(`${strapiUrl}${strapiPath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      const errorText = await strapiRes.text();
      // Handle known Strapi errors (403, 404, etc.)
      return NextResponse.json(
        { error: errorText || "Strapi error" },
        { status: strapiRes.status },
      );
    }

    const data = (await strapiRes.json()) as AccountMeResponse;
    return NextResponse.json(data);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
