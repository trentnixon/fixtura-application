import type { ApiError } from "@/lib/api/client/api-error";

export function seasonHubCodeFromApiError(error: ApiError): string | undefined {
  const details = error.details;
  if (typeof details !== "object" || details === null) {
    return undefined;
  }

  const err = (details as { error?: { code?: unknown } }).error;
  if (typeof err === "object" && err !== null && typeof err.code === "string") {
    return err.code;
  }

  return undefined;
}
