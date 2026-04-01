import { getLogoutRedirectPath } from "./logout-redirect";

export const LOGIN_REASON_SESSION = "session" as const;

/**
 * Target URL after session invalidation (401 from API, expired JWT in session check).
 * When the configured post-logout path is `/login`, appends `reason=session` for login-page copy.
 */
export function getSessionInvalidRedirectUrl(): string {
  const path = getLogoutRedirectPath().trim();
  if (path === "/login") {
    return `/login?reason=${LOGIN_REASON_SESSION}`;
  }
  if (path.startsWith("/login?")) {
    const qs = path.slice("/login?".length);
    const params = new URLSearchParams(qs);
    if (!params.has("reason")) {
      params.set("reason", LOGIN_REASON_SESSION);
    }
    return `/login?${params.toString()}`;
  }
  return path;
}
