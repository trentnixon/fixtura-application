import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

type TriggerPayload = {
  cmsFixtureId?: unknown;
  /** Alias of cmsFixtureId (Strapi game-meta-data document id) */
  fixtureId?: unknown;
  url?: unknown;
  sport?: unknown;
  dryRun?: unknown;
  metadataOnly?: unknown;
};

function parsePositiveIntId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value;
}

function optionalBoolean(value: unknown): boolean | undefined {
  if (typeof value !== "boolean") {
    return undefined;
  }
  return value;
}

/**
 * BFF: POST /api/game-meta-data/trigger-result-single-scrape
 * Upstream: POST {STRAPI}/api/game-meta-data/trigger-result-single-scrape
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

  const cmsFixtureId =
    parsePositiveIntId(payload?.cmsFixtureId) ?? parsePositiveIntId(payload?.fixtureId);
  if (!cmsFixtureId) {
    return NextResponse.json(
      {
        error: {
          status: 400,
          name: "BadRequestError",
          message: "cmsFixtureId or fixtureId must be a positive integer",
        },
      },
      { status: 400 },
    );
  }

  const upstreamBody: {
    cmsFixtureId: number;
    url?: string;
    sport?: string;
    dryRun?: boolean;
    metadataOnly?: boolean;
  } = { cmsFixtureId };
  const url = optionalString(payload?.url);
  const sport = optionalString(payload?.sport);
  const dryRun = optionalBoolean(payload?.dryRun);
  const metadataOnly = optionalBoolean(payload?.metadataOnly);
  if (url !== undefined) {
    upstreamBody.url = url;
  }
  if (sport !== undefined) {
    upstreamBody.sport = sport;
  }
  if (dryRun !== undefined) {
    upstreamBody.dryRun = dryRun;
  }
  if (metadataOnly !== undefined) {
    upstreamBody.metadataOnly = metadataOnly;
  }

  const upstream = `${strapiUrl}/api/game-meta-data/trigger-result-single-scrape`;

  try {
    const strapiRes = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(upstreamBody),
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
