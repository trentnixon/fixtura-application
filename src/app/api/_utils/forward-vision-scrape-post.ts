import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export function parsePositiveIntField(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function parseOptionalAccountId(
  value: unknown,
): { ok: true; value: number | null } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  const parsed = parsePositiveIntField(value);
  if (parsed == null) {
    return { ok: false };
  }
  return { ok: true, value: parsed };
}

export function visionScrapeBadRequest(message: string) {
  return NextResponse.json(
    {
      error: {
        status: 400,
        name: "BadRequestError",
        message,
      },
    },
    { status: 400 },
  );
}

export function visionScrapeUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type ForwardVisionScrapePostArgs = {
  strapiUrl: string;
  upstreamPath: string;
  token: string | undefined;
  upstreamBody: Record<string, unknown>;
};

export async function forwardVisionScrapePost({
  strapiUrl,
  upstreamPath,
  token,
  upstreamBody,
}: ForwardVisionScrapePostArgs): Promise<Response> {
  if (upstreamBody["accountId"] != null && !token) {
    return visionScrapeUnauthorized();
  }

  const upstream = `${strapiUrl}${upstreamPath}`;

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
