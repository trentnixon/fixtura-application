import { NextResponse } from "next/server";

export type ParseJsonBodyOrEmptyOk = { ok: true; body: unknown };
export type ParseJsonBodyOrEmptyFail = { ok: false; response: NextResponse };

/**
 * Onboarding BFF JSON write pattern: empty body → `{}`, invalid JSON → 400.
 * Non-JSON content types yield `{}` without parsing.
 */
export async function parseJsonBodyOrEmpty(
  request: Request,
): Promise<ParseJsonBodyOrEmptyOk | ParseJsonBodyOrEmptyFail> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return { ok: true, body: {} };
  }

  try {
    const text = await request.text();
    return { ok: true, body: text ? JSON.parse(text) : {} };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}
