import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

type TriggerPayload = {
  competitionId?: unknown;
};

function parseCompetitionId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

/**
 * BFF: POST /api/competition/trigger-grades-lookup-teams-single-scrape
 * Upstream: POST {STRAPI}/api/competition/trigger-grades-lookup-teams-single-scrape
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

  const competitionId = parseCompetitionId(payload?.competitionId);
  if (!competitionId) {
    return NextResponse.json(
      {
        error: {
          status: 400,
          name: "BadRequestError",
          message: "competitionId must be a positive integer",
        },
      },
      { status: 400 },
    );
  }

  const upstream = `${strapiUrl}/api/competition/trigger-grades-lookup-teams-single-scrape`;

  try {
    const strapiRes = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ competitionId }),
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
