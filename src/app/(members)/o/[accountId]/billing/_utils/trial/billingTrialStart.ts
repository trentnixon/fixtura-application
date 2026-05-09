import { ApiError } from "@/lib/api/client/api-error";
import { normalizeErrorFieldToString } from "@/lib/api/normalize-error-field";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BILLING_TRIAL_START_DURATION_DAYS } from "../../_constants/trial/billingTrialStart";

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
