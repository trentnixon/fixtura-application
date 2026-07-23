import type { OrganisationTrialErrorCode } from "@/types/api/account";

/** Calendar length of the free trial window (inclusive of start day). */
export const BILLING_TRIAL_START_DURATION_DAYS = 14;

export const BILLING_TRIAL_START_COPY = {
  cardEyebrow: "14-day free trial",
  cardTitlePrefix: "Try Fixtura free for",
  cardTitleSuffix: "days",
  noPaymentRequired: "No payment required.",
  startButtonLabel: "Start free trial",
  confirmTitlePrefix: "Start your",
  confirmTitleSuffix: "-day free trial?",
  cancelButtonLabel: "Cancel",
  confirmButtonLabel: "Confirm",
  pendingConfirmButtonLabel: "Starting trial...",
  cardTrialPlanHint:
    'The billing service could not assign a trial. Often this means no trial plan is linked to this account in CMS, while "Start trial" was still offered. Ask your team to align GET /billing flags with a configured trial tier.',
  dialogTrialPlanHint:
    "The billing API rejected start-trial (HTTP 400). Check Strapi: a free-trial / default trial tier must exist and match what GET /billing advertises via canStartTrial.",
} as const;

/** Stable POST start-trial org error codes — branch on code, not CMS message text. */
export const BILLING_TRIAL_START_ORG_ERROR_COPY = {
  TRIAL_ALREADY_CONSUMED:
    "This organisation has already used its free trial. Choose a paid plan to continue with Fixtura.",
  TRIAL_ORGANISATION_UNAVAILABLE:
    "We could not confirm organisation trial eligibility. Contact support or fix organisation linkage before trying again.",
  TRIAL_ALLOCATION_DISABLED:
    "Free trial allocation is temporarily unavailable. Please try again shortly.",
} as const satisfies Record<OrganisationTrialErrorCode, string>;

export function formatBillingTrialStartRetryAfterHint(retryAfterSeconds: number): string {
  if (retryAfterSeconds <= 1) {
    return "Try again in a moment.";
  }
  return `Try again in ${retryAfterSeconds} seconds.`;
}
