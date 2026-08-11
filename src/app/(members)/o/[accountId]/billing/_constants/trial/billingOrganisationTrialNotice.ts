import type { OrganisationTrialPresentation } from "../../_types/trial/organisationTrialPresentation";

export const BILLING_ORG_TRIAL_NOTICE_SURFACE_CLASS_NAME =
  "border-destructive/15 bg-destructive/5 ring-destructive/10 ring-1";

export const BILLING_ORG_TRIAL_NOTICE_COPY = {
  active_on_another_account: {
    title: "Free trial allocated to another account",
    description:
      "A free trial for this organisation is already active on another account. Start a paid plan from this account when you are ready.",
  },
  used: {
    title: "Organisation free trial already used",
    description:
      "This organisation has already used its free trial. Choose a paid plan to continue with Fixtura.",
  },
  unavailable: {
    title: "Organisation trial eligibility unavailable",
    description:
      "We could not confirm organisation trial eligibility. Contact support or fix organisation linkage before trying again.",
  },
} as const satisfies Record<
  Extract<OrganisationTrialPresentation, "active_on_another_account" | "used" | "unavailable">,
  { title: string; description: string }
>;
