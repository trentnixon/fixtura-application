import { ApiError } from "@/lib/api/client/api-error";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import {
  BILLING_TRIAL_START_DURATION_DAYS,
  BILLING_TRIAL_START_ORG_ERROR_COPY,
  formatBillingTrialStartRetryAfterHint,
} from "../../_constants/trial/billingTrialStart";

import type {
  AccountOrganisationContextData,
  OrganisationTrialErrorCode,
} from "@/types/api/account";

const ORGANISATION_TRIAL_ERROR_CODES = new Set<OrganisationTrialErrorCode>([
  "TRIAL_ALREADY_CONSUMED",
  "TRIAL_ORGANISATION_UNAVAILABLE",
  "TRIAL_ALLOCATION_DISABLED",
]);

const BILLING_TRIAL_ACCOUNT_NAME_FALLBACK = "your organisation";

export function resolveBillingTrialAccountName(
  orgContextData: AccountOrganisationContextData | undefined,
): string {
  return orgContextData?.accountOrganisationDetails?.Name?.trim() ?? "";
}

export function formatBillingTrialStartCardDescription(accountName: string): string {
  const owner = accountName.trim() || BILLING_TRIAL_ACCOUNT_NAME_FALLBACK;
  const possessive =
    owner === BILLING_TRIAL_ACCOUNT_NAME_FALLBACK ? "your organisation's" : `${owner}'s`;

  return `Start ${possessive} trial with no upfront payment. Explore automated content, scheduled delivery, and premium workflow tools.`;
}

export function formatBillingTrialStartConfirmDescription(accountName: string): string {
  const subject = accountName.trim() || "Your organisation";

  return `${subject} will get full Fixtura access for ${BILLING_TRIAL_START_DURATION_DAYS} days. You will not be charged today, and no payment details are required to start.`;
}

export function parseBillingTrialStartResponseMessage(body: unknown): string | null {
  const msg =
    body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message.trim()
      : "";
  return msg || null;
}

export function isBillingTrialStartTrialPlanErrorMessage(message: string): boolean {
  return message.toLowerCase().includes("trial plan");
}

export function shouldShowBillingTrialStartPlanHint(message: string | null | undefined): boolean {
  return message ? isBillingTrialStartTrialPlanErrorMessage(message) : false;
}

export function parseOrganisationTrialErrorCode(e: unknown): OrganisationTrialErrorCode | null {
  if (!(e instanceof ApiError)) {
    return null;
  }

  const details = e.details;
  if (typeof details !== "object" || details === null) {
    return null;
  }

  const errorObj = (details as Record<string, unknown>)["error"];
  if (typeof errorObj !== "object" || errorObj === null) {
    return null;
  }

  const code = (errorObj as Record<string, unknown>)["code"];
  if (
    typeof code !== "string" ||
    !ORGANISATION_TRIAL_ERROR_CODES.has(code as OrganisationTrialErrorCode)
  ) {
    return null;
  }

  return code as OrganisationTrialErrorCode;
}

export function shouldInvalidateBillingAfterStartTrialFailure(e: unknown): boolean {
  return parseOrganisationTrialErrorCode(e) !== null;
}

function messageForOrganisationTrialErrorCode(
  code: OrganisationTrialErrorCode,
  retryAfterSeconds: number | null,
): string {
  const base = BILLING_TRIAL_START_ORG_ERROR_COPY[code];
  if (code === "TRIAL_ALLOCATION_DISABLED" && retryAfterSeconds != null && retryAfterSeconds > 0) {
    return `${base} ${formatBillingTrialStartRetryAfterHint(retryAfterSeconds)}`;
  }
  return base;
}

export function messageFromBillingTrialStartFailure(e: unknown): string {
  if (!(e instanceof ApiError)) {
    return AUTH_ERROR_MESSAGES.network;
  }

  const code = parseOrganisationTrialErrorCode(e);
  if (code) {
    return messageForOrganisationTrialErrorCode(code, e.retryAfterSeconds);
  }

  const primary = e.message?.trim();
  if (primary) {
    return primary;
  }
  const d = e.details;
  if (typeof d === "object" && d !== null) {
    const rec = d as Record<string, unknown>;
    const nested =
      normalizeErrorFieldToString(rec["message"]) ?? normalizeErrorFieldToString(rec["error"]);
    if (nested) {
      return nested;
    }
  }
  return AUTH_ERROR_MESSAGES.unexpected;
}
