import { vi } from "vitest";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";

export const cookiesGet = vi.fn();
export const getStrapiUrlMock = vi.fn(() => "https://cms.example");

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: cookiesGet,
  }),
}));

vi.mock("@/lib/config/env", () => ({
  getStrapiUrl: () => getStrapiUrlMock(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

export function resetStrapiRouteTestMocks() {
  vi.resetAllMocks();
  getStrapiUrlMock.mockReturnValue("https://cms.example");
  cookiesGet.mockImplementation((name: string) =>
    name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
  );
  globalThis.fetch = vi.fn();
}

export function mockNoAuthCookie() {
  cookiesGet.mockReturnValue(undefined);
}

export function mockMissingStrapiUrl() {
  getStrapiUrlMock.mockReturnValueOnce("");
}

export function accountRouteContext(accountId: string) {
  return { params: Promise.resolve({ accountId }) };
}

export function jsonRequest(method: string, body?: unknown, url = "http://localhost"): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  return new Request(url, init);
}

export function multipartRequest(
  body: ArrayBuffer | Uint8Array,
  contentType = "multipart/form-data; boundary=----test",
  url = "http://localhost",
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}
