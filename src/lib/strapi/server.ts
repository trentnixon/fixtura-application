import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";
import { getStrapiUrl } from "@/lib/config/env";

/**
 * Server-only Strapi request using the user's JWT from the httpOnly cookie (`Authorization: Bearer`).
 * Use from Route Handlers or Server Actions that proxy to Strapi — not from client components.
 *
 * @param path - Strapi path including `/api/...` prefix (e.g. `/api/users/me`).
 */
export async function fetchStrapiWithAuthCookie(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = getStrapiUrl();
  if (!base) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = await cookies();
  const jwt = store.get(AUTH_COOKIE_NAME)?.value;
  if (!jwt?.length) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}
