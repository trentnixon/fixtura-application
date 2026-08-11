import { z } from "zod";

import { ApiError } from "@/lib/api/client/api-error";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { formatAccountDisplayName } from "./account-security-display";
import { ACCOUNT_EMPTY_VALUE_LABEL } from "../_constants/account-display-primitives";
import {
  ACCOUNT_SECURITY_EMAIL_INVALID_ERROR,
  ACCOUNT_SECURITY_PROFILE_REQUIRED_ERROR,
} from "../_constants/use-account-security-content-state";

import type { AccountSettingsData } from "@/types/api/account";

const loginEmailSchema = z.string().email();

export function createAccountSecurityProfileDraft(settings: AccountSettingsData): string {
  return formatAccountDisplayName(settings).replace(ACCOUNT_EMPTY_VALUE_LABEL, "").trim();
}

export function validateAccountSecurityProfileValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      error: ACCOUNT_SECURITY_PROFILE_REQUIRED_ERROR,
      value: null,
    };
  }

  return {
    error: null,
    value: trimmed,
  };
}

export function validateAccountSecurityLoginEmailValue(value: string) {
  const trimmed = value.trim().toLowerCase();
  const parsed = loginEmailSchema.safeParse(trimmed);

  if (!parsed.success) {
    return {
      error: ACCOUNT_SECURITY_EMAIL_INVALID_ERROR,
      value: null,
    };
  }

  return {
    error: null,
    value: parsed.data,
  };
}

export function getAccountSecurityMutationErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : AUTH_ERROR_MESSAGES.unexpected;
}
