import { ApiError } from "@/lib/api/client/api-error";

/** User-facing message for Epic 6 DELETE account failures (CMS codes on `ApiError.details`). */
export function deleteUnfinishedAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const d = error.details;
    if (typeof d === "object" && d !== null) {
      const rec = d as Record<string, unknown>;
      const code = typeof rec["code"] === "string" ? rec["code"] : undefined;
      if (code === "ACCOUNT_DELETE_NOT_ALLOWED") {
        const msg = typeof rec["message"] === "string" ? rec["message"].trim() : "";
        if (msg) return msg;
        return "This account cannot be deleted in its current state. You can go back to organisation selection or contact support if you need help.";
      }
      if ("error" in rec && typeof rec["error"] === "object" && rec["error"] !== null) {
        const err = rec["error"] as { message?: string; code?: string };
        if (
          err.code === "ACCOUNT_DELETE_NOT_ALLOWED" &&
          typeof err.message === "string" &&
          err.message.trim()
        ) {
          return err.message.trim();
        }
        if (typeof err.message === "string" && err.message.trim()) return err.message.trim();
      }
      const flatMsg = typeof rec["message"] === "string" ? rec["message"].trim() : "";
      if (flatMsg) return flatMsg;
    }
    if (error.status === 404) {
      return "We could not find that account or you no longer have access to it.";
    }
    if (error.status === 403) {
      return "Deleting this account is not allowed right now. Go back to organisation selection or contact support.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not delete the account. Try again.";
}
