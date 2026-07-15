import { ApiError } from "@/lib/api/client/api-error";

export const ACCOUNT_CREATE_BUSY_CODE = "ACCOUNT_CREATE_BUSY";

function errorCodeFromDetails(details: unknown): string | null {
  if (typeof details !== "object" || details === null) return null;
  const record = details as Record<string, unknown>;
  const nested = record["error"];
  if (typeof nested === "object" && nested !== null) {
    const code = (nested as Record<string, unknown>)["code"];
    if (typeof code === "string") return code;
  }
  if (typeof record["code"] === "string") return record["code"];
  return null;
}

/**
 * True for CMS/BFF `503 ACCOUNT_CREATE_BUSY` (blank-account obtain lock contention).
 */
export function isAccountCreateBusyError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 503) return false;
  return errorCodeFromDetails(error.details) === ACCOUNT_CREATE_BUSY_CODE;
}

/**
 * Retry delay seconds for a busy create. Uses `Retry-After` when present; otherwise 1.
 */
export function accountCreateBusyRetryAfterSeconds(error: ApiError): number {
  const fromHeader = error.retryAfterSeconds;
  if (typeof fromHeader === "number" && Number.isFinite(fromHeader) && fromHeader >= 0) {
    return fromHeader;
  }
  return 1;
}

/**
 * User-facing retryable copy for Get started / create-first busy failures.
 */
export function accountCreateBusyMessage(error: ApiError): string {
  const seconds = accountCreateBusyRetryAfterSeconds(error);
  if (seconds <= 0) {
    return "Account creation is busy. Please try again.";
  }
  if (seconds === 1) {
    return "Account creation is busy. Please wait about 1 second, then try again.";
  }
  return `Account creation is busy. Please wait about ${seconds} seconds, then try again.`;
}
