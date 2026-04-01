/**
 * Shared client POST to clear the auth cookie. Does not clear React Query or navigate.
 */
export function postLogoutRequest(): Promise<Response> {
  return fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
}
