import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { parseRetryAfterHeader } from "@/lib/api/parse-retry-after-header";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";
import { postLogoutRequest } from "@/lib/auth/logout-client";
import { getSessionInvalidRedirectUrl } from "@/lib/config/auth-redirect";

import { ApiError } from "./api-error";
import { shouldHandle401AsSessionInvalid } from "./session-invalid-401";

type FetchInit = NonNullable<Parameters<typeof globalThis.fetch>[1]>;

export interface RequestOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody | FormData;
  headers?: FetchInit["headers"];
  signal?: FetchInit["signal"];
  timeoutMs?: number;
}

/**
 * Handle session invalidation (401).
 * Clears the session server-side and redirects to login.
 */
async function handleUnauthorized(): Promise<void> {
  try {
    await postLogoutRequest();
  } catch {
    // ignore cleanup errors
  } finally {
    if (typeof window !== "undefined") {
      window.location.assign(getSessionInvalidRedirectUrl());
    }
  }
}

/**
 * Central fetch client for the application.
 * Handles:
 * - Session expiry (401)
 * - JSON parsing
 * - Error normalization
 * - Timeouts
 * - dev diagnostic metadata
 */
export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, headers, signal, timeoutMs = 15000 } = options;

  const controller = new globalThis.AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await fetch(path, {
      method,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      ...(body ? (isFormData ? { body: body as BodyInit } : { body: JSON.stringify(body) }) : {}),
      signal: signal ?? controller.signal,
    });

    // Dev diagnostic: store last error on window
    if (!response.ok && process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      (window as any).__LAST_API_ERROR__ = {
        status: response.status,
        url: path,
        method,
      };
    }

    if (response.status === 401 && shouldHandle401AsSessionInvalid(path)) {
      await handleUnauthorized();
      // Throw to stop execution flow, though location change will trigger soon
      throw new ApiError({
        status: 401,
        message: AUTH_ERROR_MESSAGES.sessionExpired,
      });
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = (() => {
        if (response.status >= 500) return AUTH_ERROR_MESSAGES.serverError;
        if (response.status === 403) return AUTH_ERROR_MESSAGES.forbidden;

        if (typeof payload === "object" && payload !== null) {
          const record = payload as Record<string, unknown>;
          const fromMessage = normalizeErrorFieldToString(record["message"]);
          if (fromMessage) return fromMessage;
          const fromError = normalizeErrorFieldToString(record["error"]);
          if (fromError) return fromError;
        }

        if (response.status === 404) return AUTH_ERROR_MESSAGES.notFound;

        return AUTH_ERROR_MESSAGES.unexpected;
      })();

      throw new ApiError({
        status: response.status,
        message,
        details: payload,
        retryAfterSeconds: parseRetryAfterHeader(response.headers.get("Retry-After")),
      });
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError({
        status: 408,
        message: "Request timed out",
      });
    }

    throw new ApiError({
      status: 500,
      message: error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.unexpected,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Standard HTTP verb wrappers
 */
export const apiClient = {
  get: <TResponse>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<TResponse>(path, { ...options, method: "GET" }),

  post: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: Omit<RequestOptions<TBody>, "method" | "body"> = {},
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "POST", body }),

  put: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: Omit<RequestOptions<TBody>, "method" | "body"> = {},
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "PUT", body }),

  patch: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: Omit<RequestOptions<TBody>, "method" | "body"> = {},
  ) => apiRequest<TResponse, TBody>(path, { ...options, method: "PATCH", body }),

  delete: <TResponse>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    apiRequest<TResponse>(path, { ...options, method: "DELETE" }),

  /** Multipart upload — do not set Content-Type (boundary set by the browser). */
  postFormData: <TResponse>(
    path: string,
    formData: FormData,
    options: Omit<RequestOptions<FormData>, "method" | "body"> = {},
  ) => apiRequest<TResponse, FormData>(path, { ...options, method: "POST", body: formData }),
};
