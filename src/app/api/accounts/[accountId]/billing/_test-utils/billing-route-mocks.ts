// Import this module before any route handler under test (vi.mock is not hoisted across files).
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

export function resetBillingRouteTestMocks() {
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
