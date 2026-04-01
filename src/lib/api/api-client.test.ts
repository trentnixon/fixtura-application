import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { apiFetch, apiFetchJson, parseJsonOrThrow } from "./api-client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("on 401 posts logout and redirects", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      value: { assign: assign },
      writable: true,
      configurable: true,
    });

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await apiFetch("/api/members/foo");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/members/foo",
      expect.objectContaining({ credentials: "same-origin" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
    expect(assign).toHaveBeenCalled();
  });
});

describe("apiFetchJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(apiFetchJson<{ ok: boolean }>("/api/x")).resolves.toEqual({ ok: true });
  });
});

describe("parseJsonOrThrow", () => {
  it("uses serverError message for 5xx regardless of JSON body", async () => {
    const res = new Response(JSON.stringify({ error: "Internal leak" }), { status: 503 });
    await expect(parseJsonOrThrow(res)).rejects.toMatchObject({
      message: AUTH_ERROR_MESSAGES.serverError,
      status: 503,
    });
  });

  it("uses forbidden message for 403", async () => {
    const res = new Response(JSON.stringify({ error: "x" }), { status: 403 });
    await expect(parseJsonOrThrow(res)).rejects.toMatchObject({
      message: AUTH_ERROR_MESSAGES.forbidden,
      status: 403,
    });
  });

  it("uses sessionExpired for 401", async () => {
    const res = new Response(JSON.stringify({ error: "x" }), { status: 401 });
    await expect(parseJsonOrThrow(res)).rejects.toMatchObject({
      message: AUTH_ERROR_MESSAGES.sessionExpired,
      status: 401,
    });
  });

  it("uses JSON error string for 4xx when present", async () => {
    const res = new Response(JSON.stringify({ error: "Custom client message" }), { status: 400 });
    await expect(parseJsonOrThrow(res)).rejects.toMatchObject({
      message: "Custom client message",
      status: 400,
    });
  });

  it("uses unexpected for 4xx without error field", async () => {
    const res = new Response("{}", { status: 404 });
    await expect(parseJsonOrThrow(res)).rejects.toMatchObject({
      message: AUTH_ERROR_MESSAGES.unexpected,
      status: 404,
    });
  });

  it("returns parsed JSON on success", async () => {
    const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
    await expect(parseJsonOrThrow(res)).resolves.toEqual({ ok: true });
  });
});
