import { ApiError } from "@/lib/api/client/api-error";

export type LoginFailureReasonCode = "invalid_credentials" | "network" | "unavailable" | "unknown";

export const analyticsFailureReasonCode = loginFailureReasonCode;

export function loginFailureReasonCode(error: unknown): LoginFailureReasonCode {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401 || error.status === 403) {
      return "invalid_credentials";
    }
    if (error.status === 0 || error.status >= 500) {
      return "unavailable";
    }
    return "unknown";
  }
  if (error instanceof TypeError) {
    return "network";
  }
  if (error instanceof Error && error.message.toLowerCase().includes("network")) {
    return "network";
  }
  return "unknown";
}
