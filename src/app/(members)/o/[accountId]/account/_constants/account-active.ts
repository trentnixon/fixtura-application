export const ACCOUNT_ACTIVE_SECTION_TITLE = "Organisation status";
export const ACCOUNT_ACTIVE_SECTION_DESCRIPTION =
  "Active keeps this organisation in the Active group. Off moves it to Inactive.";

export const ACCOUNT_ACTIVE_SWITCH_LABEL = "Active";
export const ACCOUNT_ACTIVE_SWITCH_ID = "account-is-active";

export const ACCOUNT_ACTIVE_SWITCH_DESCRIPTION =
  "Off skips new scheduled runs, on-demand renders, and health checks. Billing continues. A render already in progress still finishes. Turning it back on resumes those checks on the next sweep. Time missed while it was off is not replayed.";

export const ACCOUNT_ACTIVE_CONFIRM_OFF_TITLE = "Turn this organisation off?";
export const ACCOUNT_ACTIVE_CONFIRM_OFF_DESCRIPTION =
  "It moves to the Inactive group. New scheduled runs, on-demand renders, and health checks skip it until you turn it back on. Billing continues.";
export const ACCOUNT_ACTIVE_CONFIRM_ON_TITLE = "Turn this organisation on?";
export const ACCOUNT_ACTIVE_CONFIRM_ON_DESCRIPTION =
  "It moves back to the Active group. Scheduled runs and health checks resume on the next sweep. Time missed while it was off is not replayed.";

export const ACCOUNT_ACTIVE_CONFIRM_CANCEL_LABEL = "Cancel";
export const ACCOUNT_ACTIVE_CONFIRM_OFF_LABEL = "Turn off";
export const ACCOUNT_ACTIVE_CONFIRM_ON_LABEL = "Turn on";
export const ACCOUNT_ACTIVE_CONFIRM_SUBMITTING_LABEL = "Saving";

export const ACCOUNT_ACTIVE_TURNED_OFF_TOAST = "Organisation turned off";
export const ACCOUNT_ACTIVE_TURNED_ON_TOAST = "Organisation turned on";
