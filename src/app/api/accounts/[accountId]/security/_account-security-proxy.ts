import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

export type AccountSecurityRouteContext = { params: Promise<{ accountId: string }> };

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

async function forwardToStrapi(
  strapiUrl: string,
  accountId: string,
  segment: string,
  token: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(`${strapiUrl}/api/accounts/${accountId}/${segment}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

/**
 * BFF helper: JSON body PATCH/POST to Strapi `/api/accounts/:id/:segment`.
 * Mirrors account settings PATCH semantics (structured error envelope pass-through).
 * @see src/app/sandbox/route-lab/app/account/.docs/frontend-handoff-account-security-writes.md
 */
export async function proxyAccountSecurityJsonMutation(
  request: Request,
  context: AccountSecurityRouteContext,
  segment: string,
  method: "PATCH" | "POST",
): Promise<Response> {
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
    const strapiRes = await forwardToStrapi(strapiUrl, accountId, segment, token, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await jsonFromStrapiResponse(strapiRes);

    if (!strapiRes.ok && typeof payload === "object" && payload !== null && "error" in payload) {
      return NextResponse.json(payload as Record<string, unknown>, { status: strapiRes.status });
    }

    return nextResponseFromStrapi(strapiRes, payload);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
