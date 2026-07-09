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
  confirmStartsLabel: "Starts",
  confirmEndsLabel: "Ends",
  cancelButtonLabel: "Cancel",
  confirmButtonLabel: "Confirm",
  pendingConfirmButtonLabel: "Starting trial...",
  cardTrialPlanHint:
    'The billing service could not assign a trial. Often this means no trial plan is linked to this account in CMS, while "Start trial" was still offered. Ask your team to align GET /billing flags with a configured trial tier.',
  dialogTrialPlanHint:
    "The billing API rejected start-trial (HTTP 400). Check Strapi: a free-trial / default trial tier must exist and match what GET /billing advertises via canStartTrial.",
} as const;
