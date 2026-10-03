import { ApiError } from "@/lib/api/client/api-error";

import type { InitialPipelineStatus } from "@/types/api/account";

export const ACCOUNT_ACTIVE_NOT_MUTABLE_CODE = "ACCOUNT_ACTIVE_NOT_MUTABLE";

export function canSetAccountActive(state: {
  isSetup: boolean;
  initialSetupStatus: InitialPipelineStatus;
  initialDataFetchStatus: InitialPipelineStatus;
}): boolean {
  return (
    state.isSetup === true &&
    state.initialSetupStatus === "completed" &&
    state.initialDataFetchStatus === "completed"
  );
}

export function accountActiveErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const details = error.details;
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

export function accountActiveErrorMessage(error: unknown): string {
  if (accountActiveErrorCode(error) === ACCOUNT_ACTIVE_NOT_MUTABLE_CODE) {
    return "This organisation is still being set up, so its active status cannot be changed yet.";
  }
  if (error instanceof ApiError && error.status === 403) {
    return "Saving is blocked (403): enable the setAccountActive permission for your role in Strapi.";
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Could not update organisation status.";
}
