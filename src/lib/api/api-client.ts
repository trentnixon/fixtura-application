import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { postLogoutRequest } from "@/lib/auth/logout-client";
import { getSessionInvalidRedirectUrl } from "@/lib/config/auth-redirect";

import { ApiError } from "./api-error";

/**
 * After `apiFetch` + `parseJsonOrThrow`, catch `ApiError` and if `error.status === 403`,
 * render `AccessDeniedState` from `@/components/feedback/access-denied-state` (session stays; no logout).
 */

async function handleUnauthorized(): Promise<void> {
  try {
    await postLogoutRequest();
  } catch {
    // ignore
  } finally {
    if (typeof window !== "undefined") {
      window.location.assign(getSessionInvalidRedirectUrl());
    }
  }
}

/**
 * Use for **authenticated** app API calls (not for `/api/auth/login`).
 * On 401, clears the session server-side and redirects using `getSessionInvalidRedirectUrl()` (e.g. `/login?reason=session`).
 * Does not auto-logout on 403.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "same-origin",
  });

  if (res.status === 401) {
    await handleUnauthorized();
  }

  return res;
}

export async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (() => {
      if (res.status >= 500) {
        return AUTH_ERROR_MESSAGES.serverError;
      }
      if (res.status === 403) {
        return AUTH_ERROR_MESSAGES.forbidden;
      }
      if (res.status === 401) {
        return AUTH_ERROR_MESSAGES.sessionExpired;
      }
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        return (data as { error: string }).error;
      }
      return AUTH_ERROR_MESSAGES.unexpected;
    })();
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

/**
 * Authenticated JSON request: same 401 behaviour as `apiFetch`, then parses JSON or throws `ApiError`.
 */
export async function apiFetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await apiFetch(input, init);
  return parseJsonOrThrow<T>(res);
}
