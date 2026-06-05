import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { validatePutTemplateOptionsBody } from "@/app/api/accounts/[accountId]/template-options/validate-put-template-options-body";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";
import { getStrapiUrl } from "@/lib/config/env";

import type { PutTemplateOptionsSuccess } from "@/types/api/template-options";

type RouteContext = { params: Promise<{ accountId: string }> };

function normalizePutSuccessPayload(payload: unknown): PutTemplateOptionsSuccess | null {
  if (typeof payload !== "object" || payload === null) return null;

  const o = payload as Record<string, unknown>;
  const data = o["data"];

  if (
    typeof data === "object" &&
    data !== null &&
    typeof (data as { templateOptionId?: unknown }).templateOptionId === "number"
  ) {
    const id = (data as { templateOptionId: number }).templateOptionId;
    if (Number.isInteger(id) && id > 0) {
      return { data: { templateOptionId: id } };
    }
  }

  return null;
}

function strapiErrorResponse(payload: unknown, status: number) {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const err = (payload as { error?: unknown }).error;
    if (typeof err === "object" && err !== null && "code" in err && "message" in err) {
      return NextResponse.json(payload as Record<string, unknown>, { status });
    }
    const message = normalizeErrorFieldToString(err) ?? "Strapi error";
    return NextResponse.json({ error: message }, { status });
  }
  if (typeof payload === "string") {
    return NextResponse.json({ error: payload.trim() || "Strapi error" }, { status });
  }
  return NextResponse.json({ error: "Strapi error" }, { status });
}

/**
 * BFF for PUT /api/accounts/:accountId/template-options → Strapi put-template-options (Phase 4 flat body).
 * @see src/app/(members)/o/[accountId]/template-builder/.comms/response/handoff-put-template-options.md
 */
export async function PUT(request: Request, context: RouteContext) {
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

  const validated = validatePutTemplateOptionsBody(body);
  if (!validated.ok) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: validated.error } },
      { status: 400 },
    );
  }

  try {
    const strapiRes = await fetch(
      `${strapiUrl}/api/template-option/put-template-options/${encodeURIComponent(accountId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated.data),
        cache: "no-store",
      },
    );

    const contentType = strapiRes.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await strapiRes.json() : await strapiRes.text();

    if (!strapiRes.ok) {
      return strapiErrorResponse(payload, strapiRes.status);
    }

    const normalized = normalizePutSuccessPayload(payload);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid success response from CMS" }, { status: 502 });
    }

    return NextResponse.json(normalized, { status: strapiRes.status });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
