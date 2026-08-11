import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

type RouteContext = { params: Promise<{ accountId: string }> };

async function forwardSettingsToStrapi(
  strapiUrl: string,
  accountId: string,
  token: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(`${strapiUrl}/api/accounts/${accountId}/settings`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function jsonFromStrapiResponse(strapiRes: Response): Promise<unknown> {
  const contentType = strapiRes.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  return isJson ? await strapiRes.json() : await strapiRes.text();
}

function nextResponseFromStrapi(strapiRes: Response, payload: unknown) {
  if (!strapiRes.ok) {
    let message: string;
    if (typeof payload === "object" && payload !== null && "error" in payload) {
      const raw = (payload as { error?: unknown }).error;
      message = normalizeErrorFieldToString(raw) ?? "Strapi error";
    } else if (typeof payload === "string") {
      message = payload.trim() || "Strapi error";
    } else {
      message = "Strapi error";
    }
    return NextResponse.json({ error: message }, { status: strapiRes.status });
  }

  return NextResponse.json(payload);
}

/**
 * BFF for GET /api/accounts/:accountId/settings → Strapi account settings slice.
 * @see .comms/data-fetching/handoff/handoff-phase-02-accounts-settings.md
 */
export async function GET(_request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  try {
    const strapiRes = await forwardSettingsToStrapi(strapiUrl, accountId, token, {
      method: "GET",
    });

    const payload = await jsonFromStrapiResponse(strapiRes);
    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

/**
 * BFF for PATCH /api/accounts/:accountId/settings → Strapi saveAccountSettings.
 * @see src/app/(members)/.comms/response/frontend-handoff-patch-account-settings-save.md
 */
export async function PATCH(request: Request, context: RouteContext) {
  const strapiUrl = getStrapiUrl();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { accountId } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidAccountIdSegment(accountId)) {
    return NextResponse.json({ error: "Invalid account id" }, { status: 400 });
  }

  if (!strapiUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  try {
    const strapiRes = await forwardSettingsToStrapi(strapiUrl, accountId, token, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await jsonFromStrapiResponse(strapiRes);
    /** Pass Strapi envelopes through unchanged (including `{ error: { code, message } }`). */
    if (!strapiRes.ok && typeof payload === "object" && payload !== null && "error" in payload) {
      return NextResponse.json(payload as Record<string, unknown>, { status: strapiRes.status });
    }

    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
