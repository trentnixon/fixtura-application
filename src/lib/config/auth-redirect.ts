import { getLogoutRedirectPath } from "./logout-redirect";
import { ROUTES } from "./routes";

export const LOGIN_REASON_SESSION = "session" as const;

/**
 * Target URL after session invalidation (401 from API, expired JWT in session check).
 * When the configured post-logout path is `signIn`, appends `reason=session` for sign-in-page copy.
 */
export function getSessionInvalidRedirectUrl(): string {
  const path = getLogoutRedirectPath().trim();
  const signInPath = ROUTES.signIn;

  if (path === signInPath) {
    return `${signInPath}?reason=${LOGIN_REASON_SESSION}`;
  }
  if (path.startsWith(`${signInPath}?`)) {
    const qs = path.slice(`${signInPath}?`.length);
    const params = new URLSearchParams(qs);
    if (!params.has("reason")) {
      params.set("reason", LOGIN_REASON_SESSION);
    }
    return `${signInPath}?${params.toString()}`;
  }
  return path;
}
