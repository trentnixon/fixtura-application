import { NextResponse } from "next/server";

/**
 * Maps a Strapi `fetch` Response into a BFF `NextResponse` with the same status code
 * and JSON/text semantics used by onboarding lifecycle proxies (Epic 5).
 *
 * - JSON bodies (success or error) are passed through unchanged so `message` / error codes
 *   remain visible to `apiRequest` on the client.
 * - Non-JSON error bodies become `{ error: string }` while preserving status.
 */
export async function nextResponseFromStrapiFetch(strapiRes: Response): Promise<NextResponse> {
  const resContentType = strapiRes.headers.get("content-type");
  const isJson = resContentType?.includes("application/json");
  const payload = isJson ? await strapiRes.json() : await strapiRes.text();

  if (!strapiRes.ok) {
    if (typeof payload === "object" && payload !== null) {
      return NextResponse.json(payload, { status: strapiRes.status });
    }
    return NextResponse.json(
      { error: typeof payload === "string" ? payload : "Strapi error" },
      { status: strapiRes.status },
    );
  }

  return NextResponse.json(payload, { status: strapiRes.status });
}
