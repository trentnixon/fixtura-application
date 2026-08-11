export type OrganisationTrialPresentation =
  | "start_available"
  | "active_on_this_account"
  | "active_on_another_account"
  | "used"
  | "blocked_by_billing"
  | "unavailable";

export type OrganisationTrialPresentationResult = {
  presentation: OrganisationTrialPresentation;
  failClosed: boolean;
  /** Dev/debug reason when failClosed or unavailable */
  reason?: string;
};
