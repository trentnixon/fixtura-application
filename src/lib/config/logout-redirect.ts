import { ROUTES } from "./routes";

/**
 * Post-logout navigation target (client). Defaults to `signIn`.
 * Set `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT` to e.g. `/` for marketing home.
 */
export function getLogoutRedirectPath(): string {
  const v = process.env["NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT"];
  if (typeof v === "string") {
    const t = v.trim();
    if (t.startsWith("/") && !t.startsWith("//")) return t;
  }
  return ROUTES.signIn;
}
