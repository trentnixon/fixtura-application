import { NextResponse } from "next/server";

/**
 * Maps a Strapi `fetch` Response into a BFF `NextResponse` with the same status code
 * and JSON/text semantics used by onboarding lifecycle proxies (Epic 5).
 *
 * - JSON bodies (success or error) are passed through unchanged so `message` / error codes
 *   remain visible to `apiRequest` on the client.
 * - Non-JSON error bodies become `{ error: string }` while preserving status.
 * - Upstream `Retry-After` is forwarded when present (e.g. `503 ACCOUNT_CREATE_BUSY`).
 */
function responseInitFromStrapi(strapiRes: Response): ResponseInit {
  const init: ResponseInit = { status: strapiRes.status };
  const retryAfter = strapiRes.headers.get("Retry-After");
  if (retryAfter) {
    init.headers = { "Retry-After": retryAfter };
  }
  return init;
}

export async function nextResponseFromStrapiFetch(strapiRes: Response): Promise<NextResponse> {
  const init = responseInitFromStrapi(strapiRes);

  if (strapiRes.status === 204) {
    return new NextResponse(null, init);
  }

  const resContentType = strapiRes.headers.get("content-type");
  const isJson = resContentType?.includes("application/json");
  const payload = isJson ? await strapiRes.json() : await strapiRes.text();

  if (!strapiRes.ok) {
    if (typeof payload === "object" && payload !== null) {
      return NextResponse.json(payload, init);
    }
    return NextResponse.json(
      { error: typeof payload === "string" ? payload : "Strapi error" },
      init,
    );
  }

  return NextResponse.json(payload, init);
}
