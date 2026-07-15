import { ApiError } from "@/lib/api/client/api-error";

export type AccountUnavailableResource = "account" | "nested";

export type AccountUnavailableContext = {
  /** Use `"account"` only for account-scoped ownership failures; `"nested"` never matches. */
  resource: AccountUnavailableResource;
};

export type AccountUnavailableResult = {
  unavailable: true;
  reason: "account_not_found";
};

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

function messageLooksLikeLegacyAccountNotFound(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "account not found" ||
    normalized === "account not found." ||
    normalized.includes("account not found")
  );
}

function detailsMessage(details: unknown): string {
  if (typeof details === "string") return details;
  if (typeof details !== "object" || details === null) return "";
  const record = details as Record<string, unknown>;
  if (typeof record["message"] === "string") return record["message"];
  const nested = record["error"];
  if (typeof nested === "string") return nested;
  if (typeof nested === "object" && nested !== null) {
    const msg = (nested as Record<string, unknown>)["message"];
    if (typeof msg === "string") return msg;
  }
  return "";
}

/**
 * Narrow account-ownership unavailable detector.
 * Matches account-scoped 404 with structured `ACCOUNT_NOT_FOUND` or legacy “Account not found”
 * messaging. Does not classify nested-resource 404s (pass `resource: "nested"` or non-account codes).
 */
export function isAccountUnavailableError(
  error: unknown,
  context: AccountUnavailableContext,
): error is ApiError {
  if (context.resource !== "account") return false;
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 404) return false;

  const code = errorCodeFromDetails(error.details);
  if (code === "ACCOUNT_NOT_FOUND") return true;
  if (code != null && code !== "ACCOUNT_NOT_FOUND") return false;

  const fromDetails = detailsMessage(error.details);
  const combined = `${error.message} ${fromDetails}`.trim();
  return messageLooksLikeLegacyAccountNotFound(combined);
}

export function accountUnavailableResult(
  error: unknown,
  context: AccountUnavailableContext,
): AccountUnavailableResult | null {
  if (!isAccountUnavailableError(error, context)) return null;
  return { unavailable: true, reason: "account_not_found" };
}
