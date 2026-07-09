import { ApiError } from "@/lib/api/client/api-error";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BILLING_TRIAL_START_DURATION_DAYS } from "../../_constants/trial/billingTrialStart";

import type { AccountOrganisationContextData } from "@/types/api/account";

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

export function formatBillingTrialStartBannerDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** First and last calendar day of the trial window starting on `startDay` (local). */
export function getBillingTrialInclusiveEndDate(startDay: Date) {
  const end = new Date(startDay);
  end.setDate(end.getDate() + (BILLING_TRIAL_START_DURATION_DAYS - 1));
  return end;
}

/** Labels for the trial window when it starts today (local midnight). */
export function getBillingTrialScheduleLabelsForStartToday() {
  const trialStartDay = new Date();
  trialStartDay.setHours(0, 0, 0, 0);
  const trialLastDay = getBillingTrialInclusiveEndDate(trialStartDay);
  return {
    startLabel: formatBillingTrialStartBannerDate(trialStartDay),
    endLabel: formatBillingTrialStartBannerDate(trialLastDay),
  };
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

export function messageFromBillingTrialStartFailure(e: unknown): string {
  if (!(e instanceof ApiError)) {
    return AUTH_ERROR_MESSAGES.network;
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
