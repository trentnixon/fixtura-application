/** Calendar length of the free trial window (inclusive of start day). */
export const BILLING_TRIAL_START_DURATION_DAYS = 14;

export const BILLING_TRIAL_START_COPY = {
  cardEyebrow: "Limited-time free trial",
  cardTitlePrefix: "Unlock Fixtura free for",
  cardTitleSuffix: "days",
  cardDescription:
    "Launch your organisation's trial in seconds with no upfront payment. Explore premium automation, content delivery, and workflow tools today.",
  noPaymentRequired: "No payment required to start.",
  startButtonLabel: "Start my free trial",
  confirmTitle: "Ready to start your free trial?",
  confirmDescriptionPrefix: "You're one click away from",
  confirmDescriptionSuffix:
    "of premium Fixtura access for your organisation, completely free. No payment is taken here.",
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
