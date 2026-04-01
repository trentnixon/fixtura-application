import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "./auth-constants";

export function getAuthCookieBaseOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export function getAuthCookieName(): typeof AUTH_COOKIE_NAME {
  return AUTH_COOKIE_NAME;
}
