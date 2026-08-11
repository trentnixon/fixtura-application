import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

export function resolveBrandingScreenErrorDescription(error: unknown): string {
  return error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.network;
}
