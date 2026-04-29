import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

type TriggerPayload = {
  associationId?: unknown;
};

function parseAssociationId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

/**
 * BFF: POST /api/association-overview-queues/trigger-association-single-scrape
 * Upstream: POST {STRAPI}/api/association-overview-queues/trigger-association-single-scrape
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
    return NextResponse.json(
      {
        error: {
          status: 400,
          name: "BadRequestError",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 },
    );
  }

  const associationId = parseAssociationId(payload?.associationId);
  if (!associationId) {
    return NextResponse.json(
      {
        error: {
          status: 400,
          name: "BadRequestError",
          message: "associationId must be a positive integer",
        },
      },
      { status: 400 },
    );
  }

  const upstream = `${strapiUrl}/api/association-overview-queues/trigger-association-single-scrape`;

  try {
    const strapiRes = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ associationId }),
      cache: "no-store",
    });

    const contentType = strapiRes.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const body = isJson ? await strapiRes.json() : await strapiRes.text();

    if (typeof body === "object" && body !== null) {
      return NextResponse.json(body, { status: strapiRes.status });
    }

    return NextResponse.json(
      { error: typeof body === "string" ? body : "Unexpected upstream response" },
      { status: strapiRes.status },
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
