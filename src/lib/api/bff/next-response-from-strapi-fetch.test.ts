import { describe, expect, it } from "vitest";

import { nextResponseFromStrapiFetch } from "./next-response-from-strapi-fetch";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...((init?.headers as Record<string, string>) ?? {}),
    },
  });
}

describe("nextResponseFromStrapiFetch", () => {
  it("passes through 200 JSON body and status", async () => {
    const strapiRes = jsonResponse({ data: { accountId: 1 } });
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(200);
    expect(out.headers.get("Retry-After")).toBeNull();
    expect(await out.json()).toEqual({ data: { accountId: 1 } });
  });

  it("preserves Strapi error status and JSON object (e.g. 403 with message)", async () => {
    const strapiRes = jsonResponse({ message: "Forbidden" }, { status: 403 });
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(403);
    expect(await out.json()).toEqual({ message: "Forbidden" });
  });

  it("preserves Strapi error JSON with structured fields", async () => {
    const strapiRes = jsonResponse(
      { error: { name: "ValidationError" }, message: "Invalid" },
      { status: 422 },
    );
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(422);
    expect(await out.json()).toEqual({
      error: { name: "ValidationError" },
      message: "Invalid",
    });
  });

  it("maps non-JSON error body to { error } while preserving status", async () => {
    const strapiRes = new Response("plain error", {
      status: 502,
      headers: { "content-type": "text/plain" },
    });
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(502);
    expect(await out.json()).toEqual({ error: "plain error" });
  });

  it("maps JSON null error body to { error: Strapi error }", async () => {
    const strapiRes = new Response("null", {
      status: 500,
      headers: { "content-type": "application/json" },
    });
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(500);
    expect(await out.json()).toEqual({ error: "Strapi error" });
  });

  it("returns 200 non-JSON body as JSON-encoded string payload (passthrough)", async () => {
    const strapiRes = new Response("ok", {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(200);
    expect(await out.json()).toBe("ok");
  });

  it("forwards Retry-After on 503 ACCOUNT_CREATE_BUSY", async () => {
    const strapiRes = jsonResponse(
      {
        error: {
          code: "ACCOUNT_CREATE_BUSY",
          message: "Account creation is busy. Please retry.",
        },
      },
      { status: 503, headers: { "Retry-After": "1" } },
    );
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(503);
    expect(out.headers.get("Retry-After")).toBe("1");
    expect(await out.json()).toEqual({
      error: {
        code: "ACCOUNT_CREATE_BUSY",
        message: "Account creation is busy. Please retry.",
      },
    });
  });

  it("forwards Retry-After on successful responses when present", async () => {
    const strapiRes = jsonResponse(
      { data: { accountId: 5 } },
      { status: 201, headers: { "Retry-After": "2" } },
    );
    const out = await nextResponseFromStrapiFetch(strapiRes);
    expect(out.status).toBe(201);
    expect(out.headers.get("Retry-After")).toBe("2");
  });
});
